import { Repository } from 'typeorm';
import { Client } from '../entities/Client';

export class ClientService {
  constructor(private clientRepository: Repository<Client>) {}

  async createClient(data: {
    name: string;
    document: string;
    email: string;
    phone?: string;
    type?: 'monthly' | 'hourly';
    monthlyFee?: number;
  }) {
    const client = this.clientRepository.create({
      ...data,
      type: data.type || 'hourly',
      isActive: true,
    });

    return this.clientRepository.save(client);
  }

  async getClientByDocument(document: string) {
    return this.clientRepository.findOne({ where: { document } });
  }

  async getClientById(id: string) {
    return this.clientRepository.findOne({ where: { id } });
  }

  async getAllClients() {
    return this.clientRepository.find({ where: { isActive: true } });
  }

  async getMonthlyClients() {
    return this.clientRepository.find({ where: { type: 'monthly', isActive: true } });
  }

  async updateClient(id: string, data: Partial<Client>) {
    await this.clientRepository.update(id, data);
    return this.clientRepository.findOne({ where: { id } });
  }

  async deactivateClient(id: string) {
    return this.clientRepository.update(id, { isActive: false });
  }
}
