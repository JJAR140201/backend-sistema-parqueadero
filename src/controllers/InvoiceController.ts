import { Request, Response } from 'express';
import { InvoiceService } from '../services/InvoiceService';
import * as fs from 'fs';

export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  async generateInvoice(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const invoice = await this.invoiceService.generateInvoice(sessionId);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async generatePDF(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const filePath = await this.invoiceService.generatePDF(invoiceId);

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

  async sendInvoiceViaEmail(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const result = await this.invoiceService.sendInvoiceViaEmail(invoiceId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async sendInvoiceViaSMS(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const { phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const result = await this.invoiceService.sendInvoiceViaSMS(invoiceId, phoneNumber);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getInvoicesByClient(req: Request, res: Response) {
    try {
      const { clientId } = req.params;
      const invoices = await this.invoiceService.getInvoicesByClient(clientId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getInvoicesByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const invoices = await this.invoiceService.getInvoicesByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async markInvoiceAsPaid(req: Request, res: Response) {
    try {
      const { invoiceId } = req.params;
      const { paymentMethod } = req.body;

      if (!paymentMethod) {
        return res.status(400).json({ error: 'paymentMethod is required' });
      }

      const invoice = await this.invoiceService.markInvoiceAsPaid(invoiceId, paymentMethod);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
