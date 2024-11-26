import { Entity, Column, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
import { Content } from '../../content/entities/content.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';
import { Role, ThemePreferences } from '../enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user'  , type: 'enum', enum: Role })
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

  @Column({ type: 'enum', enum: ThemePreferences, default: ThemePreferences.SYSTEM })
  preferences: ThemePreferences;

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

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @OneToMany(() => Content, content => content.user)
  contents: Content[];

  @OneToMany(() => Subscription, subscription => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => Subscription, subscription => subscription.coach)
  subscribers: Subscription[];
}