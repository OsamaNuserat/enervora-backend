import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { User } from '../../auth/entities/user.entity';
import { PaymentMethod } from '../enums';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Subscription, subscription => subscription.payments)
  subscription: Subscription;

  @ManyToOne(() => User, user => user.payments)
  user: User;

  @Column()
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ unique: true })
  transactionId: string;
}