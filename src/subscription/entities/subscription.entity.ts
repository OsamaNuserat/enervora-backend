import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { SubscriptionType } from '../enums';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.subscriptions)
  user: User;

  @ManyToOne(() => User, user => user.subscribers)
  coach: User;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column({ type: 'enum', enum: SubscriptionType })
  subscriptionType: SubscriptionType;

  @Column({ default: false })
  isActive: boolean;

  @Column({ nullable: true })
  paymentHistory: string;
}