import { Request, Response } from 'express';
import { ClientService } from '../services/ClientService';

export class ClientController {
  constructor(private clientService: ClientService) {}

  async createClient(req: Request, res: Response) {
    try {
      const { name, document, email, phone, type, monthlyFee } = req.body;

      if (!name || !document || !email) {
        return res.status(400).json({ error: 'name, document, and email are required' });
      }

      const client = await this.clientService.createClient({
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

  async getClientByDocument(req: Request, res: Response) {
    try {
      const { document } = req.params;
      const client = await this.clientService.getClientByDocument(document);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getClientById(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const client = await this.clientService.getClientById(clientId);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAllClients(req: Request, res: Response) {
    try {
      const clients = await this.clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getMonthlyClients(req: Request, res: Response) {
    try {
      const clients = await this.clientService.getMonthlyClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async updateClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const client = await this.clientService.updateClient(clientId, req.body);

      res.json(client);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async deactivateClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      await this.clientService.deactivateClient(clientId);

      res.json({ message: 'Client deactivated successfully' });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
