import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';

export function createInvoiceRoutes(invoiceController: InvoiceController): Router {
  const router = Router();

  router.post('/:sessionId', (req, res) => invoiceController.generateInvoice(req, res));
  router.get('/:invoiceId/pdf', (req, res) => invoiceController.generatePDF(req, res));
  router.post('/:invoiceId/email', (req, res) => invoiceController.sendInvoiceViaEmail(req, res));
  router.post('/:invoiceId/sms', (req, res) => invoiceController.sendInvoiceViaSMS(req, res));
  router.get('/client/:clientId', (req, res) => invoiceController.getInvoicesByClient(req, res));
  router.get('/range', (req, res) => invoiceController.getInvoicesByDateRange(req, res));
  router.put('/:invoiceId/pay', (req, res) => invoiceController.markInvoiceAsPaid(req, res));

  return router;
}
