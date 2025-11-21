import { Request, Response } from 'express';
import { ParkingService } from '../services/ParkingService';

export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  async registerEntry(req: Request, res: Response) {
    try {
      const { plate, clientId } = req.body;

      if (!plate) {
        return res.status(400).json({ error: 'Plate is required' });
      }

      const session = await this.parkingService.registerEntry(plate, clientId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async registerExit(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await this.parkingService.registerExit(sessionId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async registerExitByPlate(req: Request, res: Response) {
    try {
      const { plate } = req.body;

      if (!plate) {
        return res.status(400).json({ error: 'Plate is required' });
      }

      const session = await this.parkingService.registerExitByPlate(plate);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getActiveSessions(req: Request, res: Response) {
    try {
      const sessions = await this.parkingService.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getSessionsByPlate(req: Request, res: Response) {
    try {
      const { plate } = req.params;
      const sessions = await this.parkingService.getSessionsByPlate(plate);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
