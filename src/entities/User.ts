import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Client } from './Client';
import { ParkingSession } from './ParkingSession';
import { Invoice } from './Invoice';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 50, default: 'admin' })
  role: 'admin' | 'operator' | 'user'; // admin: full access, operator: entry/exit, user: view only

  @Column({ type: 'varchar', length: 100, nullable: true })
  company?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones: todos los datos pertenecen a este usuario
  @OneToMany(() => Client, (client) => client.user, { cascade: true })
  clients: Client[];

  @OneToMany(() => ParkingSession, (session) => session.user, { cascade: true })
  parkingSessions: ParkingSession[];

  @OneToMany(() => Invoice, (invoice) => invoice.user, { cascade: true })
  invoices: Invoice[];
}
