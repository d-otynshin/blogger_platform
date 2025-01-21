import { Injectable } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { UserSQLViewDto } from '../../api/output-dto/user.view-dto';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersSQLQueryRepository {
  constructor(private dataSource: DataSource) {}
  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserSQLViewDto[]>> {
    let sqlQuery = `FROM users`;

    const sortByDict = { createdAt: 'created_at' };

    const params = [];
    const conditions = [];

    if (query.searchLoginTerm) {
      conditions.push(`login ILIKE $${params.length + 1}`);
      params.push(`%${query.searchLoginTerm}%`);
    }

    if (query.searchEmailTerm) {
      conditions.push(`email ILIKE $${params.length + 1}`);
      params.push(`%${query.searchEmailTerm}%`);
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

    // Fetch paginated users
    const users = await this.dataSource.query(`SELECT * ${sqlQuery}`, params);

    // Count total number of users without limit/offset
    const countQuery = `SELECT COUNT(*) AS total_count ${sqlQueryCount}`;
    const countResult = await this.dataSource.query(countQuery, countParams);

    const totalCount = parseInt(countResult[0]?.total_count, 10) || 0;

    const items = users.map(UserSQLViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
