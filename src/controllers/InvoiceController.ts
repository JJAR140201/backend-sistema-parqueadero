import { Request, Response } from 'express';
import { InvoiceService } from '../services/InvoiceService';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as fs from 'fs';

export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  async generateInvoice(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { sessionId } = req.params;
      const invoice = await this.invoiceService.generateInvoice(sessionId, req.userId);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async generatePDF(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { invoiceId } = req.params;
      const filePath = await this.invoiceService.generatePDF(invoiceId, req.userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="factura.pdf"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        fs.unlink(filePath, () => {});
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getInvoicesByClient(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { clientId } = req.params;
      const invoices = await this.invoiceService.getInvoicesByClient(clientId, req.userId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getInvoicesByDateRange(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const invoices = await this.invoiceService.getInvoicesByDateRange(
        new Date(startDate as string),
        new Date(endDate as string),
        req.userId
      );
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async markInvoiceAsPaid(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { invoiceId } = req.params;
      const { paymentMethod } = req.body;

      if (!paymentMethod) {
        return res.status(400).json({ error: 'Payment method is required' });
      }

      const invoice = await this.invoiceService.markInvoiceAsPaid(invoiceId, req.userId, paymentMethod);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getAllInvoices(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const invoices = await this.invoiceService.getAllInvoices(req.userId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
