import { Repository } from 'typeorm';
import { Invoice } from '../entities/Invoice';
import { ParkingSession } from '../entities/ParkingSession';
import { Client } from '../entities/Client';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

export class InvoiceService {
  constructor(
    private invoiceRepository: Repository<Invoice>,
    private parkingSessionRepository: Repository<ParkingSession>,
    private clientRepository: Repository<Client>
  ) {}

  async generateInvoice(sessionId: string) {
    const session = await this.parkingSessionRepository.findOne({
      where: { id: sessionId },
      relations: ['vehicle', 'client'],
    });

    if (!session) {
      throw new Error('Parking session not found');
    }

    if (!session.exitTime) {
      throw new Error('Vehicle has not exited yet');
    }

    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = this.invoiceRepository.create({
      parkingSessionId: sessionId,
      clientId: session.clientId,
      invoiceNumber,
      entryTime: session.entryTime,
      exitTime: session.exitTime,
      amount: session.totalAmount,
      durationHours: session.durationHours,
      status: 'pending',
    });

    await this.invoiceRepository.save(invoice);
    return invoice;
  }

  async generatePDF(invoiceId: string): Promise<string> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['client', 'parkingSession', 'parkingSession.vehicle'],
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const doc = new PDFDocument();
    const fileName = `factura_${invoice.invoiceNumber}.pdf`;
    const filePath = path.join('/tmp', fileName);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Encabezado
    doc.fontSize(20).font('Helvetica-Bold').text('FACTURA DE PARQUEADERO', 100, 50);
    doc.fontSize(10).font('Helvetica').text(`Número: ${invoice.invoiceNumber}`, 100, 100);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 100, 120);

    // Información de sesión
    doc.fontSize(12).font('Helvetica-Bold').text('Información de Parqueo', 100, 160);
    doc.fontSize(10).font('Helvetica')
      .text(`Placa: ${invoice.parkingSession.vehicle?.plate}`, 100, 185)
      .text(`Entrada: ${invoice.entryTime.toLocaleString()}`, 100, 205)
      .text(`Salida: ${invoice.exitTime.toLocaleString()}`, 100, 225)
      .text(`Duración: ${invoice.durationHours} horas`, 100, 245);

    // Información del cliente
    if (invoice.client) {
      doc.fontSize(12).font('Helvetica-Bold').text('Información del Cliente', 100, 285);
      doc.fontSize(10).font('Helvetica')
        .text(`Nombre: ${invoice.client.name}`, 100, 310)
        .text(`Documento: ${invoice.client.document}`, 100, 330)
        .text(`Email: ${invoice.client.email}`, 100, 350);
    }

    // Total
    doc.fontSize(14).font('Helvetica-Bold').text(`Total: $${invoice.amount}`, 100, 400);
    doc.fontSize(10).font('Helvetica').text('Estado: PENDIENTE DE PAGO', 100, 430);

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    });
  }

  async sendInvoiceViaEmail(invoiceId: string) {
    // Implementar integración con servicio de email
    // Por ahora solo retornar un mock
    return { success: true, message: 'Email enviado' };
  }

  async sendInvoiceViaSMS(invoiceId: string, phoneNumber: string) {
    // Implementar integración con Twilio
    // Por ahora solo retornar un mock
    return { success: true, message: 'SMS enviado' };
  }

  async getInvoicesByClient(clientId: string) {
    return this.invoiceRepository.find({
      where: { clientId },
      relations: ['parkingSession'],
    });
  }

  async getInvoicesByDateRange(startDate: Date, endDate: Date) {
    return this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.createdAt >= :start', { start: startDate })
      .andWhere('invoice.createdAt <= :end', { end: endDate })
      .orderBy('invoice.createdAt', 'DESC')
      .getMany();
  }

  async markInvoiceAsPaid(invoiceId: string, paymentMethod: string) {
    const invoice = await this.invoiceRepository.findOne({ where: { id: invoiceId } });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    invoice.status = 'paid';
    invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = new Date();

    return this.invoiceRepository.save(invoice);
  }
}
