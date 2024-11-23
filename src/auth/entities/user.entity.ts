import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ThemePreferences } from '../enum';

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

  @Column({ default: 'user' })
  role: string;

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
}