import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  shortCode: string;

  @Index()
  @Column()
  longUrl: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: 0 })
  click_count: number;

  @Column({ type: 'datetime', nullable: true })
  last_accessed_at: Date;

  @ManyToOne(() => User, (user) => user.urls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // This specifies the foreign key column
  user: User;
}
