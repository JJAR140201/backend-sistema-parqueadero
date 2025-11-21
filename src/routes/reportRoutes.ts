import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';
import { authMiddleware } from '../middlewares/authMiddleware';

export function createReportRoutes(reportController: ReportController): Router {
  const router = Router();

  router.get('/daily', authMiddleware, (req, res) => reportController.generateDailyReport(req as any, res));
  router.get('/monthly', authMiddleware, (req, res) => reportController.generateMonthlyReport(req as any, res));
  router.get('/daily/xlsx', authMiddleware, (req, res) => reportController.exportDailyReportToXlsx(req as any, res));
  router.get('/monthly/xlsx', authMiddleware, (req, res) => reportController.exportMonthlyReportToXlsx(req as any, res));
  router.get('/daily/range', authMiddleware, (req, res) => reportController.getDailyReports(req as any, res));
  router.get('/monthly/year', authMiddleware, (req, res) => reportController.getMonthlyReports(req as any, res));

  return router;
}
