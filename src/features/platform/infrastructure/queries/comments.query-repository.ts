import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Comment } from '../../domain/comment.entity';
import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './get-posts-query-params';
import { PostsRepository } from '../repositories/posts.repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { toSnakeCase } from '../../../../core/libs/transfrom-snake-case';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsTypeOrmRepository: Repository<Comment>,

    private readonly postsRepository: PostsRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId: string | undefined,
  ): Promise<CommentOutputDto> {
    const comment = await this.commentsTypeOrmRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.interactions', 'interaction')
      .leftJoinAndSelect('comment.commentator', 'commentator')
      .where('comment.id = :commentId', { commentId })
      .getOne();

    if (!comment) {
      throw NotFoundDomainException.create('Not Found', 'commentId');
    }

    return CommentOutputDto.mapToView(comment, userId);
  }

  async getCommentsByPostId(
    postId: string,
    query: GetPostsQueryParams,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<CommentOutputDto[]>> {
    const post = await this.postsRepository.findById(postId);

    if (!post) {
      throw NotFoundDomainException.create('Post not found', 'postId');
    }

    const comments = await this.commentsTypeOrmRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.commentator', 'commentator')
      .leftJoinAndSelect('comment.interactions', 'interaction')
      .leftJoinAndSelect('interaction.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .where('post.id = :postId', { postId })
      .orderBy(
        toSnakeCase(query.sortBy),
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getMany();

    console.log('COMMENTS BY POST ID', comments);

    // Total count query
    const totalCount = await this.commentsTypeOrmRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.post', 'post')
      .where('post.id = :postId', { postId })
      .getCount();

    // Transform interactions into desired JSON format
    const items = comments.map((comment: Comment) => {
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
