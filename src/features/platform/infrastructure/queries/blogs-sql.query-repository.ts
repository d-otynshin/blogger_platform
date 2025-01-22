import { DataSource } from 'typeorm';
import { GetBlogsQueryParams } from '../../api/input-dto/helpers/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogsSQLRepository } from '../repositories/blogs-sql.repository';
import { BlogSQLOutputDto } from '../../api/output-dto/blog.output-dto';
import { PostSQLOutputDto } from '../../api/output-dto/post-sql.output-dto';
import { PostsSQLQueryRepository } from './posts-sql.query-repository';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { GetPostsQueryParams } from './get-posts-query-params';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsSQLQueryRepository {
  constructor(
    private dataSource: DataSource,
    private blogsRepository: BlogsSQLRepository,
    private postsQueryRepository: PostsSQLQueryRepository,
  ) {}

  async getById(id: string) {
    const blogData = await this.blogsRepository.findById(id);

    if (!blogData) {
      throw NotFoundDomainException.create('blog not found', 'id');
    }

    return BlogSQLOutputDto.mapToView(blogData);
  }

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogSQLOutputDto[]>> {
    let sqlQuery = `FROM blogs`;

    const sortByDict = { createdAt: 'created_at' };

    const params = [];
    const conditions = [];

    if (query.searchNameTerm) {
      conditions.push(`login ILIKE $${params.length + 1}`);
      params.push(`%${query.searchNameTerm}%`);
    }

    if (conditions.length > 0) {
      sqlQuery = sqlQuery + ' WHERE ' + conditions.join(' OR ');
    }

    const sqlQueryCount = sqlQuery;
    const countParams = [...params];

    // Add sorting and pagination
    sqlQuery += ` ORDER BY "${sortByDict[query.sortBy] || query.sortBy}" ${query.sortDirection}`;
    sqlQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(query.pageSize, (query.pageNumber - 1) * query.pageSize);

    // Fetch paginated blogs
    const blogs = await this.dataSource.query(`SELECT * ${sqlQuery}`, params);

    // Count total number of blogs without limit/offset
    const countQuery = `SELECT COUNT(*) AS total_count ${sqlQueryCount}`;
    const countResult = await this.dataSource.query(countQuery, countParams);

    const totalCount = parseInt(countResult[0]?.total_count, 10) || 0;

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
    const blogData = await this.blogsRepository.findById(id);

    if (!blogData) {
      throw NotFoundDomainException.create('blog not found', 'id');
    }

    return this.postsQueryRepository.getPostsByBlogId(id, query, userId);
  }
}
