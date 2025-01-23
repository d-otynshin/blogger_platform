import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TInteraction } from '../../dto/interaction-dto';
import { CreateCommentDto, UpdateCommentDto } from '../../dto/comment-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

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
    const query = `SELECT * FROM comments WHERE id = $1`;

    const result = await this.dataSource.query(query, [id]);
    return result[0];
  }

  async updateInstance(commentId: string, dto: UpdateCommentDto) {
    const query = `UPDATE comments SET content = $2 WHERE id = $1`;
    const result = await this.dataSource.query(query, [commentId, dto.content]);

    return result.length > 0;
  }

  async deleteInstance(id: string) {
    const query = `DELETE FROM comments WHERE id = $1 RETURNING *`;
    const result = await this.dataSource.query(query, [id]);
    // TODO: correct all query responses
    return result[0].length > 0;
  }

  async createInteraction(
    commentId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    const uuid = crypto.randomUUID();

    const query = `
      INSERT INTO comments_interactions (id, comment_id, user_id, action, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      uuid,
      commentId,
      userId,
      action,
      new Date().toISOString(),
    ]);

    return result.length > 0;
  }

  async getInteractions(commentId: string) {
    const commentData = await this.getById(commentId);

    if (!commentData) {
      throw NotFoundDomainException.create('No comment found');
    }

    const query = `SELECT * FROM comments_interactions WHERE comment_id = $1`;

    return this.dataSource.query(query, [commentId]);
  }

  async updateInteractionById(
    commentId: string,
    userId: string,
    action: string,
  ): Promise<boolean> {
    const query = `
      UPDATE comments_interactions
      SET action = $3
      WHERE comment_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      commentId,
      userId,
      action,
    ]);

    return result[0].length > 0;
  }

  async deleteAll() {
    const query = 'DELETE FROM comments';
    const result = await this.dataSource.query(query);
    return result.affectedRows > 0;
  }
}
