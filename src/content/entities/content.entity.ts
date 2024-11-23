import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  mediaUrl: string;

  @Column()
  category: string;

  @Column({ default: false })
  isSubscriptionBased: boolean;

  @ManyToOne(() => User, user => user.contents)
  user: User;
}