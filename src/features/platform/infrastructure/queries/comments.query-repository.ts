import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../core/exceptions/domain-exceptions';
import { GetPostsQueryParams } from './get-posts-query-params';
import { CommentsRepository } from '../repositories/comments.repository';
import { PostsRepository } from '../repositories/posts.repository';
import { UsersRepository } from '../../../accounts/infrastructure/repositories/users.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    private dataSource: DataSource,
    private readonly postsRepository: PostsRepository,
    private readonly commentRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentOutputDto> {
    const commentData = await this.commentRepository.getById(commentId);

    if (!commentData) {
      throw NotFoundDomainException.create('Comment not found', 'id');
    }

    const commentatorData = await this.usersRepository.findById(
      commentData.commentator.id,
    );

    if (!commentatorData) {
      throw BadRequestDomainException.create('Not Found', 'user');
    }

    const interactions =
      await this.commentRepository.getInteractions(commentId);

    const commentWithLogin = {
      ...commentData,
      interactions,
      commentator_login: commentatorData.login,
    };

    return CommentOutputDto.mapToView(commentWithLogin, userId);
  }

  async getCommentsByPostId(
    postId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    const postData = await this.postsRepository.findById(postId);
    if (!postData) {
      throw NotFoundDomainException.create('Post not found', 'postId');
    }

    let sqlQuery = `
      FROM comments c
      LEFT JOIN users u ON c.commentator_id = u.id
      LEFT JOIN comments_interactions ci ON c.id = ci.comment_id
      WHERE post_id = $3
      GROUP BY c.id, u.id, u.login
    `;

    const sortByDict = { createdAt: 'created_at' };

    sqlQuery += ` ORDER BY "${sortByDict[query.sortBy] || query.sortBy}" ${query.sortDirection}`;
    sqlQuery += ` LIMIT $1 OFFSET $2`;

    const comments = await this.dataSource.query(
      `
         SELECT c.*,
         u.id AS user_id, u.login AS user_login,
         JSON_AGG(
            JSON_BUILD_OBJECT(
                'user_id', ci.user_id, 
                'action', ci.action, 
                'added_at', ci.added_at
            )
        ) FILTER (WHERE ci.user_id IS NOT NULL) AS interactions ${sqlQuery}
      `,
      [query.pageSize, (query.pageNumber - 1) * query.pageSize, postId],
    );

    const countResult = await this.dataSource.query(
      'SELECT COUNT(*) AS total_count FROM comments WHERE post_id = $1',
      [postId],
    );

    const totalCount = parseInt(countResult[0].total_count, 10);

    const items = comments.map((comment: any) =>
      CommentOutputDto.mapToView(comment, userId),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
