import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import { Url } from '../url-shortener/url.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ unique: true })
  api_key: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @OneToMany(() => Url, (url) => url.user)
  urls: Url[];
}
