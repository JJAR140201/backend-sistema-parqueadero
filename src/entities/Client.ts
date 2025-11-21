import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { ParkingSession } from './ParkingSession';
import { Invoice } from './Invoice';
import { User } from './User';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  document: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'varchar', enum: ['monthly', 'hourly'], default: 'hourly' })
  type: 'monthly' | 'hourly';

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthlyFee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.clients)
  user: User;

  @OneToMany(() => ParkingSession, session => session.client)
  parkingSessions: ParkingSession[];

  @OneToMany(() => Invoice, invoice => invoice.client)
  invoices: Invoice[];
}
