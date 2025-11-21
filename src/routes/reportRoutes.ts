import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

export function createReportRoutes(reportController: ReportController): Router {
  const router = Router();

  router.get('/daily', (req, res) => reportController.generateDailyReport(req, res));
  router.get('/monthly', (req, res) => reportController.generateMonthlyReport(req, res));
  router.get('/daily/xlsx', (req, res) => reportController.exportDailyReportToXlsx(req, res));
  router.get('/monthly/xlsx', (req, res) => reportController.exportMonthlyReportToXlsx(req, res));
  router.get('/daily/range', (req, res) => reportController.getDailyReports(req, res));
  router.get('/monthly/year', (req, res) => reportController.getMonthlyReports(req, res));

  return router;
}
