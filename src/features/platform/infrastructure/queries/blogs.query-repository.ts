import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog.entity';
import { GetBlogsQueryParams } from '../../api/input-dto/helpers/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsRepository } from '../repositories/blogs.repository';
import { BlogSQLOutputDto } from '../../api/output-dto/blog.output-dto';
import { PostSQLOutputDto } from '../../api/output-dto/post-sql.output-dto';
import { PostsQueryRepository } from './posts.query-repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { GetPostsQueryParams } from './get-posts-query-params';

@Injectable()
export class BlogsQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private blogsTypeOrmRepository: Repository<Blog>,

    private blogsRepository: BlogsRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async getById(id: string) {
    const blog: Blog = await this.blogsRepository.findById(id);

    if (!blog) {
      throw NotFoundDomainException.create('blog not found', 'id');
    }

    return BlogSQLOutputDto.mapToView(blog);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogSQLOutputDto[]>> {
    const queryBuilder = this.blogsTypeOrmRepository.createQueryBuilder('blog');

    // Apply search filters
    if (query.searchNameTerm) {
      queryBuilder.orWhere('blog.name ILIKE :name', {
        name: `%${query.searchNameTerm}%`,
      });
    }

    // Apply sorting
    const sortBy = query.sortBy ? query.sortBy : 'created_at';
    const sortDirection = query.sortDirection.toUpperCase() || 'ASC';
    queryBuilder.orderBy(sortBy, sortDirection as 'ASC' | 'DESC');

    // Apply pagination
    queryBuilder.skip((query.pageNumber - 1) * query.pageSize);
    queryBuilder.take(query.pageSize);

    // Fetch paginated blogs
    const [blogs, totalCount] = await queryBuilder.getManyAndCount();

    // Map the blogs to the SQL View DTO
    const items = blogs.map(BlogSQLOutputDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }

  async getAllPosts(
    id: string,
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    const blog: Blog = await this.blogsRepository.findById(id);

    if (!blog) {
      throw NotFoundDomainException.create('blog not found', 'id');
    }

    return this.postsQueryRepository.getPostsByBlogId(id, query, userId);
  }
}
