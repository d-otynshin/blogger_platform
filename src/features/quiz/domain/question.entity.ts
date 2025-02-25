import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @Column()
  body: string;

  @Column('text', { array: true })
  correct_answers: string[];

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date | null;

  @Column({ default: false })
  published: boolean;
}
