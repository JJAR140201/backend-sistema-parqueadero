import { Repository } from 'typeorm';
import { DailyReport } from '../entities/DailyReport';
import { MonthlyReport } from '../entities/MonthlyReport';
import { ParkingSession } from '../entities/ParkingSession';
import * as ExcelJS from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export class ReportService {
  constructor(
    private dailyReportRepository: Repository<DailyReport>,
    private monthlyReportRepository: Repository<MonthlyReport>,
    private parkingSessionRepository: Repository<ParkingSession>
  ) {}

  async generateDailyReport(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.parkingSessionRepository
      .createQueryBuilder('session')
      .where('session.entryTime >= :start', { start: startOfDay })
      .andWhere('session.entryTime <= :end', { end: endOfDay })
      .getMany();

    const totalVehicles = new Set(sessions.map(s => s.vehicleId)).size;
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    const report = this.dailyReportRepository.create({
      reportDate: date,
      totalVehicles,
      totalRevenue,
      monthlySubscriptionRevenue: 0,
      hoursOpen: 24,
      details: `Daily report for ${date.toDateString()}`,
    });

    return this.dailyReportRepository.save(report);
  }

  async generateMonthlyReport(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await this.parkingSessionRepository
      .createQueryBuilder('session')
      .where('session.entryTime >= :start', { start: startDate })
      .andWhere('session.entryTime <= :end', { end: endDate })
      .getMany();

    const totalVehicles = new Set(sessions.map(s => s.vehicleId)).size;
    const totalRevenue = sessions.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const averageRevenuePerVehicle = totalVehicles > 0 ? totalRevenue / totalVehicles : 0;

    const report = this.monthlyReportRepository.create({
      month,
      year,
      totalVehicles,
      totalRevenue,
      monthlySubscriptionRevenue: 0,
      averageRevenuePerVehicle,
      details: `Monthly report for ${month}/${year}`,
    });

    return this.monthlyReportRepository.save(report);
  }

  async exportDailyReportToXlsx(date: Date): Promise<string> {
    const report = await this.generateDailyReport(date);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.parkingSessionRepository
      .createQueryBuilder('session')
      .where('session.entryTime >= :start', { start: startOfDay })
      .andWhere('session.entryTime <= :end', { end: endOfDay })
      .leftJoinAndSelect('session.vehicle', 'vehicle')
      .leftJoinAndSelect('session.client', 'client')
      .getMany();

    const wb = ExcelJS.utils.book_new();
    
    // Sheet 1: Resumen
    const ws1 = ExcelJS.utils.json_to_sheet([
      { 'Fecha': date.toDateString() },
      { 'Total de Vehículos': report.totalVehicles },
      { 'Ingresos Totales': report.totalRevenue },
      { 'Horas de Operación': report.hoursOpen },
    ]);
    ExcelJS.utils.book_append_sheet(wb, ws1, 'Resumen');

    // Sheet 2: Detalle de sesiones
    const sessionData = sessions.map(s => ({
      'Placa': s.vehicle?.plate,
      'Entrada': s.entryTime,
      'Salida': s.exitTime || 'Activa',
      'Duración (horas)': s.durationHours,
      'Monto': s.totalAmount,
      'Cliente': s.client?.name,
      'Estado': s.status,
    }));
    const ws2 = ExcelJS.utils.json_to_sheet(sessionData);
    ExcelJS.utils.book_append_sheet(wb, ws2, 'Sesiones');

    const fileName = `reporte_diario_${date.toISOString().split('T')[0]}.xlsx`;
    const filePath = path.join('/tmp', fileName);
    
    ExcelJS.writeFile(wb, filePath);
    return filePath;
  }

  async exportMonthlyReportToXlsx(month: number, year: number): Promise<string> {
    const report = await this.generateMonthlyReport(month, year);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await this.parkingSessionRepository
      .createQueryBuilder('session')
      .where('session.entryTime >= :start', { start: startDate })
      .andWhere('session.entryTime <= :end', { end: endDate })
      .leftJoinAndSelect('session.vehicle', 'vehicle')
      .leftJoinAndSelect('session.client', 'client')
      .getMany();

    const wb = ExcelJS.utils.book_new();

    // Sheet 1: Resumen
    const ws1 = ExcelJS.utils.json_to_sheet([
      { 'Período': `${month}/${year}` },
      { 'Total de Vehículos': report.totalVehicles },
      { 'Ingresos Totales': report.totalRevenue },
      { 'Ingresos por Suscripción': report.monthlySubscriptionRevenue },
      { 'Promedio por Vehículo': report.averageRevenuePerVehicle },
    ]);
    ExcelJS.utils.book_append_sheet(wb, ws1, 'Resumen');

    // Sheet 2: Detalle de sesiones
    const sessionData = sessions.map(s => ({
      'Placa': s.vehicle?.plate,
      'Entrada': s.entryTime,
      'Salida': s.exitTime || 'Activa',
      'Duración (horas)': s.durationHours,
      'Monto': s.totalAmount,
      'Cliente': s.client?.name,
      'Estado': s.status,
    }));
    const ws2 = ExcelJS.utils.json_to_sheet(sessionData);
    ExcelJS.utils.book_append_sheet(wb, ws2, 'Sesiones');

    const fileName = `reporte_mensual_${month}_${year}.xlsx`;
    const filePath = path.join('/tmp', fileName);
    
    ExcelJS.writeFile(wb, filePath);
    return filePath;
  }

  async getDailyReports(startDate: Date, endDate: Date) {
    return this.dailyReportRepository
      .createQueryBuilder('report')
      .where('report.reportDate >= :start', { start: startDate })
      .andWhere('report.reportDate <= :end', { end: endDate })
      .orderBy('report.reportDate', 'DESC')
      .getMany();
  }

  async getMonthlyReports(year: number) {
    return this.monthlyReportRepository
      .createQueryBuilder('report')
      .where('report.year = :year', { year })
      .orderBy('report.month', 'ASC')
      .getMany();
  }
}
