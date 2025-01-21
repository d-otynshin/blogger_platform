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
    let sqlQuery = `FROM users WHERE `;

    const params = [];
    const conditions = [];

    const sortByDict = {
      createdAt: 'created_at',
    };

    if (query.searchLoginTerm) {
      conditions.push(`login ILIKE $${params.length + 1}`);
      params.push(`%${query.searchLoginTerm}%`);
    }

    if (query.searchEmailTerm) {
      conditions.push(`email ILIKE $${params.length + 1}`);
      params.push(`%${query.searchEmailTerm}%`);
    }

    sqlQuery += conditions.length ? conditions.join(' OR ') : 'TRUE';

    // Add sorting and pagination
    sqlQuery += ` ORDER BY "${sortByDict[query.sortBy] || query.sortBy}" ${query.sortDirection}`;
    sqlQuery += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

    params.push(query.pageSize, (query.pageNumber - 1) * query.pageSize);

    // Fetch paginated users
    const users = await this.dataSource.query(`SELECT * ${sqlQuery}`, params);

    // Count total number of users without limit/offset
    const countQuery = `SELECT COUNT(*) AS totalCount ${sqlQuery}`;

    const countResult = await this.dataSource.query(countQuery);

    const totalCount = parseInt(countResult[0].totalcount, 10);

    const items = users.map(UserSQLViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
