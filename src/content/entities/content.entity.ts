import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { ContentCategory } from '../enums';

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

  @Column({
    type: 'enum',
    enum: ContentCategory,
  })
  category: ContentCategory;

  @Column({ default: false })
  isSubscriptionBased: boolean;

  @ManyToOne(() => User, (user) => user.contents)
  user: User;
}
