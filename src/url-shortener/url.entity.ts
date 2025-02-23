import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

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
}
