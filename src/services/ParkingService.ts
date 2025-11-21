import { Repository } from 'typeorm';
import { ParkingSession } from '../entities/ParkingSession';
import { Vehicle } from '../entities/Vehicle';
import { Client } from '../entities/Client';

export class ParkingService {
  constructor(
    private parkingRepository: Repository<ParkingSession>,
    private vehicleRepository: Repository<Vehicle>,
    private clientRepository: Repository<Client>
  ) {}

  async registerEntry(plate: string, userId: string, clientId?: string) {
    // Buscar o crear vehículo
    let vehicle = await this.vehicleRepository.findOne({ where: { plate } });
    
    if (!vehicle) {
      vehicle = this.vehicleRepository.create({
        plate,
        brand: 'Unknown',
        color: 'Unknown',
      });
      await this.vehicleRepository.save(vehicle);
    }

    // Crear sesión de parqueo
    const parkingSession = this.parkingRepository.create({
      vehicleId: vehicle.id,
      clientId: clientId,
      userId: userId, // Asociar al usuario autenticado
      entryTime: new Date(),
      status: 'active',
    });

    await this.parkingRepository.save(parkingSession);
    return parkingSession;
  }

  async registerExit(sessionId: string, userId: string, clientId?: string) {
    const session = await this.parkingRepository.findOne({
      where: { id: sessionId, userId: userId }, // Validar que pertenece al usuario
      relations: ['client'],
    });

    if (!session) {
      throw new Error('Parking session not found');
    }

    session.exitTime = new Date();
    session.status = 'completed';

    // Calcular duración y costo
    const { duration, cost } = this.calculateCost(session.entryTime, session.exitTime, session.client);
    session.durationHours = parseFloat(duration.toFixed(2));
    session.totalAmount = cost;

    await this.parkingRepository.save(session);
    return session;
  }

  async registerExitByPlate(plate: string, userId: string) {
    const vehicle = await this.vehicleRepository.findOne({ where: { plate } });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    const session = await this.parkingRepository.findOne({
      where: { vehicleId: vehicle.id, status: 'active', userId: userId }, // Filtrar por usuario
      relations: ['client'],
    });

    if (!session) {
      throw new Error('No active parking session found for this vehicle');
    }

    return this.registerExit(session.id, userId, session.clientId);
  }

  private calculateCost(entryTime: Date, exitTime: Date, client?: Client): { duration: number; cost: number } {
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    const hourlyRate = parseFloat(process.env.HOURLY_RATE || '5000');

    // Si el cliente es de suscripción mensual, no cobra tarifa adicional
    if (client && client.type === 'monthly') {
      return { duration: durationHours, cost: 0 };
    }

    // Cálculo de tarifa por hora
    const cost = Math.ceil(durationHours) * hourlyRate;

    return { duration: durationHours, cost };
  }

  async getActiveSessions(userId: string) {
    return this.parkingRepository.find({
      where: { status: 'active', userId: userId }, // Filtrar por usuario
      relations: ['vehicle', 'client'],
    });
  }

  async getSessionsByPlate(plate: string, userId: string) {
    const vehicle = await this.vehicleRepository.findOne({ where: { plate } });
    
    if (!vehicle) {
      return [];
    }

    return this.parkingRepository.find({
      where: { vehicleId: vehicle.id, userId: userId }, // Filtrar por usuario
      relations: ['client'],
    });
  }

  async getAllSessions(userId: string) {
    return this.parkingRepository.find({
      where: { userId: userId }, // Filtrar por usuario
      relations: ['vehicle', 'client'],
      order: { createdAt: 'DESC' },
    });
  }
}
