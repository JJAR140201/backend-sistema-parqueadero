import { Request, Response } from 'express';
import { ReportService } from '../services/ReportService';
import { AuthRequest } from '../middlewares/authMiddleware';
import * as fs from 'fs';

export class ReportController {
  constructor(private reportService: ReportService) {}

  async generateDailyReport(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'date is required' });
      }

      const report = await this.reportService.generateDailyReport(new Date(date as string), req.userId);
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async generateMonthlyReport(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: 'month and year are required' });
      }

      const report = await this.reportService.generateMonthlyReport(
        parseInt(month as string),
        parseInt(year as string),
        req.userId
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async exportDailyReportToXlsx(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'date is required' });
      }

      const filePath = await this.reportService.exportDailyReportToXlsx(new Date(date as string), req.userId);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_diario.xlsx"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        fs.unlink(filePath, () => {});
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async exportMonthlyReportToXlsx(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: 'month and year are required' });
      }

      const filePath = await this.reportService.exportMonthlyReportToXlsx(
        parseInt(month as string),
        parseInt(year as string),
        req.userId
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="reporte_mensual.xlsx"`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('end', () => {
        fs.unlink(filePath, () => {});
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getDailyReports(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate and endDate are required' });
      }

      const reports = await this.reportService.getDailyReports(
        new Date(startDate as string),
        new Date(endDate as string),
        req.userId
      );

      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  async getMonthlyReports(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { year } = req.query;

      if (!year) {
        return res.status(400).json({ error: 'year is required' });
      }

      const reports = await this.reportService.getMonthlyReports(parseInt(year as string), req.userId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
