import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { Comment } from '../../domain/comment.entity';
import { CommentOutputDto } from '../../api/output-dto/comment.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from './get-posts-query-params';
import { PostsRepository } from '../repositories/posts.repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private commentsTypeOrmRepository: Repository<Comment>,

    private readonly postsRepository: PostsRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId?: string,
  ): Promise<CommentOutputDto> {
    const comment = await this.commentsTypeOrmRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.interactions', 'interaction')
      .leftJoinAndSelect('comment.commentator', 'commentator')
      .where('comment.id = :commentId', { commentId })
      .getOne();

    return CommentOutputDto.mapToView(comment, userId);
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

    // const sortByDict = { createdAt: 'created_at' };

    const comments = await this.commentsTypeOrmRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.interactions', 'interaction')
      .leftJoinAndSelect('interaction.user', 'user')
      .leftJoinAndSelect('comment.post', 'post')
      .where('post.id = :postId', { postId })
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
