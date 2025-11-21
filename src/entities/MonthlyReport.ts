import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('monthly_reports')
export class MonthlyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  month: number;

  @Column()
  year: number;

  @Column()
  totalVehicles: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlySubscriptionRevenue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  averageRevenuePerVehicle: number;

  @Column({ type: 'text', nullable: true })
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}
