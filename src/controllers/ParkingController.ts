import { Request, Response } from 'express';
import { ParkingService } from '../services/ParkingService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class ParkingController {
  constructor(private parkingService: ParkingService) {}

  async registerEntry(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { plate, clientId } = req.body;

      if (!plate) {
        return res.status(400).json({ error: 'Plate is required' });
      }

      const session = await this.parkingService.registerEntry(plate, req.userId, clientId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async registerExit(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { sessionId } = req.params;
      const session = await this.parkingService.registerExit(sessionId, req.userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async registerExitByPlate(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { plate } = req.body;

      if (!plate) {
        return res.status(400).json({ error: 'Plate is required' });
      }

      const session = await this.parkingService.registerExitByPlate(plate, req.userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getActiveSessions(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const sessions = await this.parkingService.getActiveSessions(req.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getSessionsByPlate(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { plate } = req.params;
      const sessions = await this.parkingService.getSessionsByPlate(plate, req.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAllSessions(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const sessions = await this.parkingService.getAllSessions(req.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
