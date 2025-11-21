import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Vehicle } from './Vehicle';
import { Client } from './Client';
import { Invoice } from './Invoice';
import { User } from './User';

@Entity('parking_sessions')
export class ParkingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vehicleId: string;

  @Column({ nullable: true })
  clientId: string;

  @Column()
  entryTime: Date;

  @Column({ nullable: true })
  exitTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ type: 'varchar', enum: ['active', 'completed', 'cancelled'], default: 'active' })
  status: 'active' | 'completed' | 'cancelled';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  durationHours: number;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Vehicle, vehicle => vehicle.parkingSessions)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => User, user => user.parkingSessions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Client, client => client.parkingSessions, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToOne(() => Invoice, invoice => invoice.parkingSession, { nullable: true })
  invoice: Invoice;
}
