import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn, JoinColumn, OneToMany
} from 'typeorm';

import { Blog } from './blog.entity';
import { PostsInteraction } from './posts-interaction.entity';

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  short_description: string;

  @Column()
  content: string;

  @Column()
  blog_name: string;

  @ManyToOne(() => Blog, (blog) => blog.posts, { onDelete: 'CASCADE' })
  blog: Blog;

  @OneToMany(() => Post, (post) => post.interactions)
  interactions: PostsInteraction[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
