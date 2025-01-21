import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TInteraction } from '../../dto/interaction-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { CreateCommentDto } from '../../dto/comment-dto';

@Injectable()
export class CommentsSQLRepository {
  constructor(private dataSource: DataSource) {}

  async createInstance(dto: CreateCommentDto) {
    const uuid = crypto.randomUUID();

    const query = `
      INSERT INTO comments (id, content, commentator_id, post_id, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      uuid,
      dto.content,
      dto.commentatorId,
      dto.postId,
      new Date().toISOString(),
    ]);

    return result[0];
  }

  async getById(id: string) {
    const query = `
        SELECT * FROM comments WHERE id = ${id}
    `;

    const result = await this.dataSource.query(query, [id]);
    return result[0];
  }

  async getInteractions(id: string): Promise<TInteraction[] | null> {
    const commentData = await this.getById(id);

    if (!commentData) {
      throw NotFoundDomainException.create('No comment found');
    }

    // TODO: change to interactions request
    return commentData;
  }
}
