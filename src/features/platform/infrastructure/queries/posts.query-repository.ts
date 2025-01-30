import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { Post } from '../../domain/post.entity';
import { PostsRepository } from '../repositories/posts.repository';
import {
  PostSQLOutputDto,
  PostView,
} from '../../api/output-dto/post-sql.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { InjectRepository } from '@nestjs/typeorm';

export class GetPostsQueryParams extends BaseSortablePaginationParams<string> {
  sortBy = 'createdAt';
}

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private postsTypeOrmRepository: Repository<Post>,

    private postsRepository: PostsRepository,
  ) {}

  async getById(postId: string, userId?: string): Promise<PostSQLOutputDto> {
    const post = await this.postsRepository.findById(postId);

    console.log('postData by id', post);

    if (!post) throw NotFoundDomainException.create('Post not found');

    const postInteractions =
      await this.postsRepository.getInteractionsById(postId);

    return PostSQLOutputDto.mapToView(
      {
        ...post,
        interactions: postInteractions,
      },
      userId,
    );
  }

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    const sortByDict = { createdAt: 'created_at', blogName: 'blog_name' };

    const postsQueryBuilder = this.postsTypeOrmRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('posts_interactions', 'pi')
      .leftJoinAndSelect('pi.user', 'u')
      .groupBy('p.id')
      .addGroupBy('pi.user_id')
      .addGroupBy('u.id')
      .orderBy(
        sortByDict[query.sortBy] || query.sortBy,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      ) // Sorting
      .take(query.pageSize) // Limit
      .skip((query.pageNumber - 1) * query.pageSize); // Offset

    const posts = await postsQueryBuilder.getMany();

    const totalCount = await this.postsTypeOrmRepository
      .createQueryBuilder('p')
      .getCount();

    // Transform interactions into desired JSON format
    const items = posts.map((post: PostView) => {
      post.interactions = post.interactions.map((interaction: any) => ({
        user_id: interaction.user.id,
        user_login: interaction.user.login,
        action: interaction.action,
        added_at: interaction.addedAt,
      }));

      return PostSQLOutputDto.mapToView(post, userId);
    });

    // Return paginated result
    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getPostsByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    const sortByDict = { createdAt: 'created_at' };

    // Base QueryBuilder for posts
    const postsQueryBuilder = this.postsTypeOrmRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('posts_interactions', 'pi', 'pi.post_id = p.id')
      .leftJoinAndSelect('users', 'u', 'u.id = pi.user_id')
      .where('p.blog_id = :blogId', { blogId })
      .groupBy('p.id')
      .addGroupBy('pi.id')
      .addGroupBy('u.id')
      .orderBy(
        sortByDict[query.sortBy] || query.sortBy,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      ) // Sorting
      .take(query.pageSize) // LIMIT
      .skip((query.pageNumber - 1) * query.pageSize); // OFFSET

    // Fetch paginated posts
    const posts = await postsQueryBuilder.getMany();

    // Total count query
    const totalCount = await this.postsTypeOrmRepository
      .createQueryBuilder('p')
      .where('p.blog.id = :blogId', { blogId })
      .getCount();

    // Transform interactions into desired JSON format
    const items = posts.map((post: PostView) => {
      post.interactions = post.interactions.map((interaction: any) => ({
        user_id: interaction.user.id,
        user_login: interaction.user.login,
        action: interaction.action,
        added_at: interaction.addedAt,
      }));

      return PostSQLOutputDto.mapToView(post, userId);
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
