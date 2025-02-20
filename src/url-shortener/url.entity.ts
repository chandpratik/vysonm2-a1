import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  shortCode: string;

  @Column()
  longUrl: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
