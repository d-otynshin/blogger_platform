import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CreateBlogDto, UpdateBlogDto } from '../../dto/blog-dto';

@Injectable()
export class BlogsSQLRepository {
  constructor(private dataSource: DataSource) {}

  async createInstance(dto: CreateBlogDto): Promise<CreateBlogDto> {
    const uuid = crypto.randomUUID();

    const query = `
      INSERT INTO blogs (id, name, description, website_url, is_membership, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      uuid,
      dto.name,
      dto.description,
      dto.websiteUrl,
      false,
      new Date().toISOString(),
    ]);

    return result[0];
  }

  async findById(id: string) {
    const query = `SELECT * FROM blogs WHERE id = $1 LIMIT 1`;
    const result = await this.dataSource.query(query, [id]);

    return result[0];
  }

  async delete(id: string) {
    const query = `DELETE FROM blogs WHERE id = $1`;
    const result = await this.dataSource.query(query, [id]);

    return result[0].length > 0;
  }

  async updateById(id: string, dto: UpdateBlogDto): Promise<boolean> {
    const query = `
      UPDATE blogs 
      SET name = $2, description = $3, website_url = $4
      WHERE id = $1
      RETURNING *;
    `;

    const result = await this.dataSource.query(query, [
      id,
      dto.name,
      dto.description,
      dto.websiteUrl,
    ]);

    return result.length > 0;
  }
}
