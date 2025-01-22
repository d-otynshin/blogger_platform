import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from '../../dto/post-dto';

@Injectable()
export class PostsSQLRepository {
  constructor(private dataSource: DataSource) {}

  async createInstance(blogId: string, dto: CreatePostDto) {
    const uuid = crypto.randomUUID();

    const query = `
      INSERT INTO posts (id, title, short_description, content, blog_name, blog_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      uuid,
      dto.title,
      dto.shortDescription,
      dto.content,
      dto.blogName,
      blogId,
      new Date().toISOString(),
    ]);

    return result[0];
  }

  async findById(id: string) {
    const query = `SELECT * FROM posts WHERE id = $1 LIMIT 1`;
    const result = await this.dataSource.query(query, [id]);

    return result[0];
  }

  async findByBlogId(blogId: string) {
    const query = `SELECT * FROM posts WHERE blog_id = $1 LIMIT 1`;
    const result = await this.dataSource.query(query, [blogId]);

    return result[0];
  }

  async delete(id: string) {
    const query = `DELETE FROM posts WHERE id = $1`;
    const result = await this.dataSource.query(query, [id]);

    return result[1] > 0;
  }

  async updateById(postId: string, dto: UpdatePostDto) {
    const query = `
      UPDATE posts
      SET title = $2, short_description = $3, content = $4
      WHERE id = $1
      RETURNING *  
    `;

    const result = await this.dataSource.query(query, [
      postId,
      dto.title,
      dto.shortDescription,
      dto.content,
    ]);

    return result.length > 0;
  }

  async createInteraction(
    postId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    const uuid = crypto.randomUUID();

    const query = `
      INSERT INTO posts_interactions (id, post_id, user_id, action, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      uuid,
      postId,
      userId,
      action,
      new Date().toISOString(),
    ]);

    return result.length > 0;
  }

  async getInteractionById(postId: string) {
    const query = `SELECT * FROM posts_interactions WHERE post_id = $1`;

    return this.dataSource.query(query, [postId]);
  }

  async updateInteractionById(
    postId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    const query = `
      UPDATE posts_interactions
      SET action = $3
      WHERE post_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [postId, userId, action]);

    return result.length > 0;
  }

  async deleteAll() {
    const query = 'DELETE FROM posts';
    const result = await this.dataSource.query(query);
    return result.affectedRows > 0;
  }
}
