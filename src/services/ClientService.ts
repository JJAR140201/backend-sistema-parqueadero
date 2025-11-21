import { Repository } from 'typeorm';
import { Client } from '../entities/Client';

export class ClientService {
  constructor(private clientRepository: Repository<Client>) {}

  async createClient(userId: string, data: {
    name: string;
    document: string;
    email: string;
    phone?: string;
    type?: 'monthly' | 'hourly';
    monthlyFee?: number;
  }) {
    const client = this.clientRepository.create({
      ...data,
      userId: userId, // Asociar al usuario autenticado
      type: data.type || 'hourly',
      isActive: true,
    });

    return this.clientRepository.save(client);
  }

  async getClientByDocument(document: string, userId: string) {
    return this.clientRepository.findOne({ where: { document, userId } }); // Filtrar por usuario
  }

  async getClientById(id: string, userId: string) {
    return this.clientRepository.findOne({ where: { id, userId } }); // Filtrar por usuario
  }

  async getAllClients(userId: string) {
    return this.clientRepository.find({ where: { isActive: true, userId } }); // Filtrar por usuario
  }

  async getMonthlyClients(userId: string) {
    return this.clientRepository.find({ where: { type: 'monthly', isActive: true, userId } }); // Filtrar por usuario
  }

  async updateClient(id: string, userId: string, data: Partial<Client>) {
    const client = await this.clientRepository.findOne({ where: { id, userId } }); // Validar que pertenece al usuario
    if (!client) throw new Error('Client not found');
    
    await this.clientRepository.update(id, data);
    return this.clientRepository.findOne({ where: { id, userId } });
  }

  async deactivateClient(id: string, userId: string) {
    const client = await this.clientRepository.findOne({ where: { id, userId } }); // Validar que pertenece al usuario
    if (!client) throw new Error('Client not found');
    
    return this.clientRepository.update(id, { isActive: false });
  }
}
