import { Request, Response } from 'express';
import { BookingPlacementService } from '../services/bookingPlacementService';
import { ConfigService } from '../../../../modules/config/services/configService';
import { asyncHandler } from '../../../../core/shared/utils/asyncHandler';

export class BookingPlacementController {
  constructor(
    private readonly placementService: BookingPlacementService,
    private readonly configService: ConfigService
  ) {}

  getPlacement = asyncHandler(async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bookingId = parseInt(idParam || '', 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
    }

    const showPosizionamento = await this.configService.getShowPosizionamento();
    if (!showPosizionamento) {
      return res.status(403).json({ success: false, message: 'Funzionalità posizionamento non abilitata' });
    }

    const placement = await this.placementService.getPlacementByBookingId(bookingId);
    res.json({ success: true, data: placement ? placement : null });
  });

  upsertPlacement = asyncHandler(async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const bookingId = parseInt(idParam || '', 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
    }

    const showPosizionamento = await this.configService.getShowPosizionamento();
    if (!showPosizionamento) {
      return res.status(403).json({ success: false, message: 'Funzionalità posizionamento non abilitata' });
    }

    const { bodyZone, view, x, y, sizeWidth, sizeHeight, notes } = req.body;

    if (!bodyZone) {
      return res.status(400).json({ success: false, message: 'Zona corporea obbligatoria' });
    }

    const saved = await this.placementService.savePlacement({
      bookingId,
      bodyZone,
      view: view || 'FRONT',
      x: x !== undefined ? parseFloat(x) : null,
      y: y !== undefined ? parseFloat(y) : null,
      sizeWidth: sizeWidth !== undefined ? parseFloat(sizeWidth) : null,
      sizeHeight: sizeHeight !== undefined ? parseFloat(sizeHeight) : null,
      notes: notes || null,
    });

    res.json({
      success: true,
      message: 'Posizionamento salvato con successo',
      data: saved,
    });
  });
}
