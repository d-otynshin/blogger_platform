import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { PostsSQLRepository } from '../repositories/posts-sql.repository';
import { PostSQLOutputDto } from '../../api/output-dto/post-sql.output-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../../core/exceptions/domain-exceptions';
import { BaseSortablePaginationParams } from '../../../../core/dto/base.query-params.input-dto';

export class GetPostsQueryParams extends BaseSortablePaginationParams<string> {
  sortBy = 'createdAt';
}

@Injectable()
export class PostsSQLQueryRepository {
  constructor(
    private dataSource: DataSource,
    private postsRepository: PostsSQLRepository,
  ) {}

  async getById(postId: string, userId?: string): Promise<PostSQLOutputDto> {
    const postData = await this.postsRepository.findById(postId);

    if (!postData) {
      throw NotFoundDomainException.create('Post not found');
    }

    return PostSQLOutputDto.mapToView(postData, userId);
  }

  async getAllPosts(
    query: GetPostsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<PostSQLOutputDto[]>> {
    let sqlQuery = `FROM posts`;

    const sortByDict = { createdAt: 'created_at' };
    const params: number[] = [];

    const sqlQueryCount = sqlQuery;
    const countParams = [...params];

    sqlQuery += ` ORDER BY "${sortByDict[query.sortBy] || query.sortBy}" ${query.sortDirection}`;
    sqlQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(query.pageSize, (query.pageNumber - 1) * query.pageSize);

    const posts = await this.dataSource.query(`SELECT * ${sqlQuery}`, params);

    // Count total number of posts without limit/offset
    const countQuery = `SELECT COUNT(*) AS total_count ${sqlQueryCount}`;
    const countResult = await this.dataSource.query(countQuery, countParams);

    const totalCount = parseInt(countResult[0]?.total_count, 10) || 0;

    const items = posts.map((post) => PostSQLOutputDto.mapToView(post, userId));

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
    let sqlQuery = `FROM posts WHERE blog_id = $1`;

    const sortByDict = { createdAt: 'created_at' };
    const params: (string | number)[] = [blogId];

    const sqlQueryCount = sqlQuery;
    const countParams = [...params];

    sqlQuery += ` ORDER BY "${sortByDict[query.sortBy] || query.sortBy}" ${query.sortDirection}`;
    sqlQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(query.pageSize, (query.pageNumber - 1) * query.pageSize);

    const posts = await this.dataSource.query(`SELECT * ${sqlQuery}`, params);

    // Count total number of posts without limit/offset
    const countQuery = `SELECT COUNT(*) AS total_count ${sqlQueryCount}`;
    const countResult = await this.dataSource.query(countQuery, countParams);

    const totalCount = parseInt(countResult[0]?.total_count, 10) || 0;

    const items = posts.map((post) => PostSQLOutputDto.mapToView(post, userId));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
