import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Comment } from '../../domain/comment.entity';
import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './get-posts-query-params';
import { CommentsRepository } from '../repositories/comments.repository';
import { PostsRepository } from '../repositories/posts.repository';
import { UsersRepository } from '../../../accounts/infrastructure/repositories/users.repository';
import {
  BadRequestDomainException,
  NotFoundDomainException,
} from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsTypeOrmRepository: Repository<Comment>,

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

    const sortByDict = { createdAt: 'created_at' };

    // Base QueryBuilder for comments
    const commentsQueryBuilder = this.commentsTypeOrmRepository
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.commentator', 'u')
      .leftJoinAndSelect('c.interactions', 'ci')
      .where('c.post.id = :postId', { postId })
      .groupBy('c.id')
      .addGroupBy('u.id')
      .orderBy(
        sortByDict[query.sortBy] || query.sortBy,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      ) // Sorting
      .take(query.pageSize) // LIMIT
      .skip((query.pageNumber - 1) * query.pageSize); // OFFSET

    // Fetch paginated comments
    const comments = await commentsQueryBuilder.getMany();

    // Total count query
    const totalCount = await this.commentsTypeOrmRepository
      .createQueryBuilder('c')
      .where('c.post.id = :postId', { postId })
      .getCount();

    type CommentView = Comment & {
      interactions?: any;
    };

    // Transform interactions into desired JSON format
    const items = comments.map((comment: CommentView) => {
      comment.interactions = comment.interactions.map((interaction: any) => ({
        user_id: interaction.user.id,
        user_login: interaction.user.login,
        action: interaction.action,
        added_at: interaction.addedAt,
      }));

      return CommentOutputDto.mapToView(comment, userId);
    });

    // Return paginated result
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
