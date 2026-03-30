import { Request, Response } from 'express';
import { TeamService } from '../services/team.service';

export class TeamController {
  private service = new TeamService();

  getUsers = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getAllUsers();
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  };

  createUser = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createUser(req.body);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };

  getShifts = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getShifts(req.query.weekStart as string);
      res.json(data);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  };

  createShift = async (req: Request, res: Response) => {
    try {
      const data = await this.service.createShift(req.body);
      res.status(201).json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };

  updateShift = async (req: Request, res: Response) => {
    try {
      const data = await this.service.updateShift(req.params.id as string, req.body);
      res.json(data);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };

  deleteShift = async (req: Request, res: Response) => {
    try {
      await this.service.deleteShift(req.params.id as string);
      res.status(204).send();
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  };
}
