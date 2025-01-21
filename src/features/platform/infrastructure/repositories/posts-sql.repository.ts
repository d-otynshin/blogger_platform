import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreatePostDto, UpdatePostDto } from '../../dto/post-dto';

@Injectable()
export class PostsSQLRepository {
  constructor(private dataSource: DataSource) {}

  async createInstance(blogId: string, dto: CreatePostDto) {
    const uuid = crypto.randomUUID();

    const query = `
      INSERT INTO blogs (id, title, short_description, content, blog_name, blog_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
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

  async delete(id: string) {
    const query = `DELETE FROM posts WHERE id = $1`;
    const result = await this.dataSource.query(query, [id]);

    return result[0] > 1;
  }

  async updateById(id: string, dto: UpdatePostDto) {
    const query = `
      UPDATE posts
      SET
        title = $2
        short_description = $3
        content = $4
      WHERE id = $1
      RETURNING *  
    `;

    const result = await this.dataSource.query(query, [
      id,
      dto.title,
      dto.shortDescription,
      dto.content,
    ]);

    return result[0];
  }
}
