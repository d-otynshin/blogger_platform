import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  login: string;

  @Column()
  password_hash: string;

  @Column()
  confirmation_code: string;

  @Column({ default: false })
  is_confirmed: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
