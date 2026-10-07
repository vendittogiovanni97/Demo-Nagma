import type { WASocket, ConnectionState } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import pino from 'pino';
import { logger } from '../../../core/shared/utils/logger';
import { toInternationalDigits } from './whatsappService';

export type WhatsAppConnectionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface WhatsAppSessionInfo {
  status: WhatsAppConnectionStatus;
  qrCodeDataUrl: string | null;
  phoneNumber: string | null;
  userName: string | null;
}

// Baileys è un pacchetto solo ESM: caricarlo con import() dinamico evita che il
// require di CommonJS (es. sotto tsx nei test di integrazione) fallisca all'avvio.
const loadBaileys = () => import('@whiskeysockets/baileys');

const MAX_RECONNECT_ATTEMPTS = 5;
// Dopo i tentativi rapidi, con un telefono già associato si continua a riprovare
// lentamente: un calo di rete non deve fermare gli auguri fino a un intervento manuale.
const SLOW_RECONNECT_MS = 5 * 60 * 1000;

export class BaileysService {
  private socket: WASocket | null = null;
  private status: WhatsAppConnectionStatus = 'DISCONNECTED';
  private qrCodeDataUrl: string | null = null;
  private connectedPhone: string | null = null;
  private connectedName: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private starting: Promise<void> | null = null;

  constructor(private readonly authDir = path.resolve(process.cwd(), 'whatsapp_auth')) {}

  getStatus(): WhatsAppSessionInfo {
    return {
      status: this.status,
      qrCodeDataUrl: this.qrCodeDataUrl,
      phoneNumber: this.connectedPhone,
      userName: this.connectedName,
    };
  }

  isConnected(): boolean {
    return this.status === 'CONNECTED' && this.socket !== null;
  }

  hasSavedSession(): boolean {
    return fs.existsSync(path.join(this.authDir, 'creds.json'));
  }

  /** All'avvio del server: si ricollega solo se il telefono era già stato associato. */
  async resumeSavedSession(): Promise<void> {
    if (!this.hasSavedSession()) return;
    await this.startSocket();
  }

  /** Azione dell'utente ("Collega" / "Rigenera QR"): sostituisce l'eventuale socket in corso. */
  async connect(): Promise<WhatsAppSessionInfo> {
    if (this.isConnected()) return this.getStatus();
    this.reconnectAttempts = 0;
    this.closeSocket();
    await this.startSocket();
    return this.getStatus();
  }

  async disconnect(): Promise<void> {
    this.clearReconnectTimer();
    const sock = this.socket;
    this.socket = null;
    if (sock) {
      await sock.logout().catch((err: unknown) => {
        logger.warn('[BaileysService] Logout non riuscito, chiudo comunque la sessione', {
          error: err instanceof Error ? err.message : String(err),
        });
      });
      sock.end(undefined);
    }
    this.clearAuthFiles();
    this.resetState();
    this.reconnectAttempts = 0;
  }

  async sendTextMessage(toPhone: string, text: string): Promise<boolean> {
    if (!this.socket || !this.isConnected()) {
      logger.warn('[BaileysService] Invio richiesto ma WhatsApp non è collegato');
      return false;
    }

    try {
      const number = toInternationalDigits(toPhone);
      const [account] = (await this.socket.onWhatsApp(number)) ?? [];
      if (!account?.exists) {
        logger.warn(`[BaileysService] Il numero ${number} non è registrato su WhatsApp`);
        return false;
      }
      await this.socket.sendMessage(account.jid, { text });
      logger.info(`[BaileysService] Messaggio inviato a ${number}`);
      return true;
    } catch (err) {
      logger.error(`[BaileysService] Invio messaggio a ${toPhone} non riuscito`, {
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  }

  private async startSocket(): Promise<void> {
    if (this.starting) return this.starting;
    this.starting = this.createSocket().finally(() => {
      this.starting = null;
    });
    return this.starting;
  }

  private async createSocket(): Promise<void> {
    this.clearReconnectTimer();
    this.status = 'CONNECTING';
    this.qrCodeDataUrl = null;

    try {
      fs.mkdirSync(this.authDir, { recursive: true });
      const { default: makeWASocket, useMultiFileAuthState } = await loadBaileys();
      const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Nagma Tattoo Studio', 'Chrome', '1.0.0'],
      });
      this.socket = sock;

      sock.ev.on('creds.update', saveCreds);
      sock.ev.on('connection.update', (update) => void this.onConnectionUpdate(sock, update));
    } catch (err) {
      this.resetState();
      logger.error('[BaileysService] Avvio del client WhatsApp non riuscito', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  private async onConnectionUpdate(sock: WASocket, update: Partial<ConnectionState>): Promise<void> {
    // Eventi di un socket già sostituito (es. dopo "Rigenera QR") vanno ignorati.
    if (this.socket !== sock) return;
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        this.qrCodeDataUrl = await QRCode.toDataURL(qr);
      } catch (err) {
        logger.error('[BaileysService] Generazione QR Code non riuscita', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (connection === 'open') {
      this.status = 'CONNECTED';
      this.qrCodeDataUrl = null;
      this.reconnectAttempts = 0;
      const userJid = sock.user?.id ?? '';
      this.connectedPhone = userJid.split(':')[0] || userJid.split('@')[0] || null;
      this.connectedName = sock.user?.name ?? null;
      logger.info(`[BaileysService] Collegato come ${this.connectedPhone} (${this.connectedName ?? 'Studio'})`);
      return;
    }

    if (connection !== 'close') return;

    this.socket = null;
    this.resetState();
    const statusCode = (lastDisconnect?.error as { output?: { statusCode?: number } } | undefined)?.output?.statusCode;

    const { DisconnectReason } = await loadBaileys();
    if (statusCode === DisconnectReason.loggedOut) {
      logger.warn('[BaileysService] Sessione scollegata dal telefono: credenziali rimosse');
      this.clearAuthFiles();
      return;
    }

    let delay: number;
    if (this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      delay = Math.min(5000 * this.reconnectAttempts, 20000);
    } else if (this.hasSavedSession()) {
      delay = SLOW_RECONNECT_MS;
    } else {
      logger.warn(`[BaileysService] Connessione chiusa (codice ${statusCode}): QR non scansionato, riconnessione sospesa`);
      return;
    }
    logger.warn(`[BaileysService] Connessione chiusa (codice ${statusCode}), nuovo tentativo tra ${delay / 1000}s`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.startSocket();
    }, delay);
  }

  private closeSocket(): void {
    this.clearReconnectTimer();
    const sock = this.socket;
    this.socket = null;
    sock?.end(undefined);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private resetState(): void {
    this.status = 'DISCONNECTED';
    this.qrCodeDataUrl = null;
    this.connectedPhone = null;
    this.connectedName = null;
  }

  private clearAuthFiles(): void {
    try {
      fs.rmSync(this.authDir, { recursive: true, force: true });
    } catch (err) {
      logger.warn('[BaileysService] Pulizia delle credenziali WhatsApp non riuscita', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
