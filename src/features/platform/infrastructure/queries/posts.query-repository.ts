import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { Post } from '../../domain/post.entity';
import { PostSQLOutputDto } from '../../api/output-dto/post-sql.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { toSnakeCase } from '../../../../core/libs/transfrom-snake-case';

export class GetPostsQueryParams extends BaseSortablePaginationParams<string> {
  sortBy = 'createdAt';
}

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectRepository(Post)
    private postsTypeOrmRepository: Repository<Post>,
  ) {}

  async getById(postId: string, userId?: string): Promise<PostSQLOutputDto> {
    const post = await this.postsTypeOrmRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.interactions', 'interaction')
      .leftJoinAndSelect('interaction.user', 'user')
      .leftJoinAndSelect('post.blog', 'blog')
      .where('post.id = :postId', { postId })
      .getOne();

    if (!post) throw NotFoundDomainException.create('Post not found');

    console.log('POST', post);

    return PostSQLOutputDto.mapToView(post, userId);
  }

  async getAllPosts(
    query: GetPostsQueryParams,
    userId: string | undefined,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    const posts = await this.postsTypeOrmRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.interactions', 'interaction')
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('interaction.user', 'user')
      .orderBy(
        `post.${toSnakeCase(query.sortBy)}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getMany();

    console.log('POSTs', posts);

    const totalCount = await this.postsTypeOrmRepository
      .createQueryBuilder('post')
      .getCount();

    // Transform interactions into desired JSON format
    const items = posts.map((post: Post) => {
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
    userId: string | undefined,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    const posts = await this.postsTypeOrmRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.interactions', 'interaction')
      .leftJoinAndSelect('interaction.user', 'user')
      .leftJoinAndSelect('post.blog', 'blog')
      .where('blog.id = :blogId', { blogId })
      .orderBy(
        `post.${toSnakeCase(query.sortBy)}`,
        query.sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(query.pageSize)
      .skip((query.pageNumber - 1) * query.pageSize)
      .getMany();

    console.log('POSTS', posts);

    const items = posts.map((post) => {
      const interaction = post.interactions[0];
      console.log('INTERACTION', interaction);

      return PostSQLOutputDto.mapToView(post, userId);
    });

    console.log('POSTS WITH INTERACTIONS:', items);

    const totalCount = await this.postsTypeOrmRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.blog', 'blog')
      .where('blog.id = :blogId', { blogId })
      .getCount();

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
