import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';

const service = new TeamService();

export class TeamController {
  getUsers = async (req: Request, res: Response) => {
    try {
      const data = await service.getAllUsers();
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const data = await service.createUser(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  getShifts = async (req: Request, res: Response) => {
    try {
      const data = await service.getShifts(req.query.weekStart as string | undefined);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  createShift = async (req: Request, res: Response) => {
    try {
      const data = await service.createShift(req.body);
      res.status(201).json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  updateShift = async (req: Request, res: Response) => {
    try {
      const data = await service.updateShift(String(req.params.id), req.body);
      res.json(data);
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };

  deleteShift = async (req: Request, res: Response) => {
    try {
      await service.deleteShift(String(req.params.id));
      res.status(204).send();
    } catch (e: any) {
      res.status(e.status ?? 500).json({ message: e.message });
    }
  };
}
