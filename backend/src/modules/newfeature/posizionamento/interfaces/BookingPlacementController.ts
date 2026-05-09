import { Request, Response, NextFunction } from 'express';
import { BookingPlacementService } from '../application/BookingPlacementService';
import { configService } from '../../../../container';

export class BookingPlacementController {
  constructor(private readonly placementService: BookingPlacementService) {}

  async getPlacement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const bookingId = parseInt(idParam || '', 10);
      if (isNaN(bookingId)) {
        res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
        return;
      }

      const showPosizionamento = await configService.getShowPosizionamento();
      if (!showPosizionamento) {
        res.status(403).json({ success: false, message: 'Funzionalità posizionamento non abilitata' });
        return;
      }

      const placement = await this.placementService.getPlacementByBookingId(bookingId);
      res.json({ success: true, data: placement ? placement.toJSON() : null });
    } catch (err) {
      next(err);
    }
  }

  async upsertPlacement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const bookingId = parseInt(idParam || '', 10);
      if (isNaN(bookingId)) {
        res.status(400).json({ success: false, message: 'ID prenotazione non valido' });
        return;
      }

      const showPosizionamento = await configService.getShowPosizionamento();
      if (!showPosizionamento) {
        res.status(403).json({ success: false, message: 'Funzionalità posizionamento non abilitata' });
        return;
      }

      const { bodyZone, view, x, y, sizeWidth, sizeHeight, notes } = req.body;

      if (!bodyZone) {
        res.status(400).json({ success: false, message: 'Zona corporea obbligatoria' });
        return;
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
        data: saved.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  }
}
