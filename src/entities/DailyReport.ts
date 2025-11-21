import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('daily_reports')
export class DailyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reportDate: Date;

  @Column()
  totalVehicles: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlySubscriptionRevenue: number;

  @Column()
  hoursOpen: number;

  @Column({ type: 'text', nullable: true })
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}
