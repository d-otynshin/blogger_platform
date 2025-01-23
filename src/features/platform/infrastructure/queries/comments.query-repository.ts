import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { GetPostsQueryParams } from './get-posts-query-params';
import { CommentsSQLRepository } from '../repositories/comments-sql.repository';
import { PostsSQLRepository } from '../repositories/posts-sql.repository';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    private dataSource: DataSource,
    private readonly postsRepository: PostsSQLRepository,
    private readonly commentRepository: CommentsSQLRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentOutputDto> {
    const commentData = await this.commentRepository.getById(commentId);

    if (!commentData) {
      throw NotFoundDomainException.create('Comment not found', 'id');
    }

    return CommentOutputDto.mapToView(commentData, userId);
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
      JOIN users u ON c.commentator_id = u.id
      JOIN comments_interactions ci ON c.id = ci.comment_id;
      GROUP BY c.id
    `;

    const sortByDict = { createdAt: 'created_at' };
    const params: number[] = [];

    sqlQuery += ` ORDER BY "${sortByDict[query.sortBy] || query.sortBy}" ${query.sortDirection}`;
    sqlQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(query.pageSize, (query.pageNumber - 1) * query.pageSize);

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
      params,
    );

    const countResult = await this.dataSource.query(
      'SELECT COUNT(*) AS total_count FROM comments WHERE postId = $1',
      [postId],
    );

    const totalCount = parseInt(countResult[0].total_count, 10);

    // const items = comments.map((comment: any) =>
    //   CommentOutputDto.mapToView(comment, userId),
    // );

    return PaginatedViewDto.mapToView({
      items: comments,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
