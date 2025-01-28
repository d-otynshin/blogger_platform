import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  user_id: string;

  @Column({ unique: true })
  device_id: string;

  @Column()
  ip: string;

  @Column()
  title: string;

  @Column()
  iat: number;
}
