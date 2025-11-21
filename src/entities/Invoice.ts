import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Client } from './Client';
import { ParkingSession } from './ParkingSession';
import { User } from './User';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  parkingSessionId: string;

  @Column({ nullable: true })
  clientId: string;

  @Column()
  invoiceNumber: string;

  @Column()
  entryTime: Date;

  @Column()
  exitTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  durationHours: number;

  @Column({ type: 'varchar', enum: ['pending', 'paid', 'cancelled'], default: 'pending' })
  status: 'pending' | 'paid' | 'cancelled';

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.invoices)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Client, client => client.invoices, { nullable: true })
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @OneToOne(() => ParkingSession, session => session.invoice)
  @JoinColumn({ name: 'parkingSessionId' })
  parkingSession: ParkingSession;
}
