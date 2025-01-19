import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { SubscriptionType } from '../enums';

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.subscriptions)
    user: User;

    @ManyToOne(() => User, user => user.subscribers)
    coach: User;

    @Column({ nullable: true })
    startDate: Date;

    @Column({ nullable: true })
    endDate: Date;

    @Column({ type: 'enum', enum: SubscriptionType })
    subscriptionType: SubscriptionType;

    @Column({ default: false })
    isActive: boolean;

    @Column({ nullable: true })
    gracePeriodEndDate: Date;

    @Column({ default: false })
    autoRenewal: boolean;

    @Column({ default: false })
    notificationSent: boolean;

    @OneToMany(() => Payment, payment => payment.subscription, { cascade: true })
    payments: Payment[];
}
