import { Request, Response } from 'express';
import { ClientService } from '../services/ClientService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class ClientController {
  constructor(private clientService: ClientService) {}

  async createClient(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { name, document, email, phone, type, monthlyFee } = req.body;

      if (!name || !document || !email) {
        return res.status(400).json({ error: 'name, document, and email are required' });
      }

      const client = await this.clientService.createClient(req.userId, {
        name,
        document,
        email,
        phone,
        type,
        monthlyFee,
      });

      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getClientByDocument(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { document } = req.params;
      const client = await this.clientService.getClientByDocument(document, req.userId);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getClientById(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { clientId } = req.params;
      const client = await this.clientService.getClientById(clientId, req.userId);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAllClients(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const clients = await this.clientService.getAllClients(req.userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getMonthlyClients(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const clients = await this.clientService.getMonthlyClients(req.userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async updateClient(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { clientId } = req.params;
      const client = await this.clientService.updateClient(clientId, req.userId, req.body);

      res.json(client);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async deactivateClient(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { clientId } = req.params;
      await this.clientService.deactivateClient(clientId, req.userId);

      res.json({ message: 'Client deactivated successfully' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
