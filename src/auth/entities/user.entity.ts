import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Content } from '../../content/entities/content.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { Role, Category, Specialties } from '../enum';
import { Payment } from 'src/payment/entities/payment.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ default: false })
  confirmEmail: boolean;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ nullable: true })
  resetPasswordExpires: Date;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({ nullable: true })
  bannerPicture: string;

  @Column({ default: 'Active' })
  status: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  otp: string;

  @Column({ nullable: true })
  otpExpires: Date;

  @Column({ nullable: true })
  instagramUrl: string;

  @Column({ nullable: true })
  facebookUrl: string;

  @Column({ nullable: true })
  linkedin: string;

  @Column({ nullable: true })
  youtube: string;

  @Column({ default: 0 })
  subscriberCount: number;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  postcode: number;

  @Column({ type: 'enum', enum: Category, nullable: true })
  category: Category;

  @Column({ type: 'simple-array', nullable: true })
  specialties: Specialties[];

  @Column({ default: true })
  availability: boolean;

  @OneToMany(() => Content, (content) => content.user)
  contents: Content[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => Subscription, (subscription) => subscription.coach)
  subscribers: Subscription[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Review, review => review.coach)
  coachReviews: Review[];
}