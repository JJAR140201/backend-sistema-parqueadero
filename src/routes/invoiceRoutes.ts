import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function createInvoiceRoutes(invoiceController: InvoiceController): Router {
  const router = Router();

  router.post('/:sessionId', authMiddleware, (req, res) => invoiceController.generateInvoice(req as any, res));
  router.get('/:invoiceId/pdf', authMiddleware, (req, res) => invoiceController.generatePDF(req as any, res));
  router.get('/all', authMiddleware, (req, res) => invoiceController.getAllInvoices(req as any, res));
  router.get('/client/:clientId', authMiddleware, (req, res) => invoiceController.getInvoicesByClient(req as any, res));
  router.get('/range', authMiddleware, (req, res) => invoiceController.getInvoicesByDateRange(req as any, res));
  router.put('/:invoiceId/pay', authMiddleware, (req, res) => invoiceController.markInvoiceAsPaid(req as any, res));

  return router;
}
