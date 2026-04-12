import type { RecommendedWhatsAppTemplate } from '@/types/whatsapp';

export const RECOMMENDED_WHATSAPP_TEMPLATES: RecommendedWhatsAppTemplate[] = [
  {
    name: 'Conferma Appuntamento',
    category: 'Conferma',
    description: 'Conferma manuale chiara con data, ora e artista.',
    body: 'Ciao {{nome}}, ti confermo l’appuntamento del {{data}} alle {{ora}} con {{artista}}. Se hai dubbi o imprevisti scrivimi pure qui.',
    isActive: true,
  },
  {
    name: 'Post Tattoo',
    category: 'Post tattoo',
    description: 'Messaggio post-seduta con istruzioni e disponibilita.',
    body: 'Ciao {{nome}}, grazie ancora per essere passato oggi. Ti ricordo di seguire le indicazioni post tattoo e se noti qualcosa di insolito scrivimi pure qui.',
    isActive: true,
  },
  {
    name: 'Recupero Cliente',
    category: 'Recupero',
    description: 'Messaggio morbido per riattivare clienti fermi o indecisi.',
    body: 'Ciao {{nome}}, come stai? Ti scrivo per capire se vuoi riprendere il discorso del tuo progetto tattoo. Se ti va, troviamo insieme una data comoda.',
    isActive: true,
  },
];
