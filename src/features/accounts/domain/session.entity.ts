import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  device_id: string;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column()
  iat: number;
}
