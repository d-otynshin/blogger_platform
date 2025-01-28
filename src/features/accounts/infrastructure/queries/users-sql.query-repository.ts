import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity';
import { UserSQLViewDto } from '../../api/output-dto/user.view-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private usersTypeOrmRepository: Repository<User>,
  ) {}

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserSQLViewDto[]>> {
    const queryBuilder = this.usersTypeOrmRepository.createQueryBuilder('user');

    // Apply search filters
    if (query.searchLoginTerm) {
      queryBuilder.orWhere('user.login ILIKE :login', {
        login: `%${query.searchLoginTerm}%`,
      });
    }

    if (query.searchEmailTerm) {
      queryBuilder.orWhere('user.email ILIKE :email', {
        email: `%${query.searchEmailTerm}%`,
      });
    }

    // Apply sorting
    const sortBy = query.sortBy ? query.sortBy : 'created_at';
    const sortDirection = query.sortDirection.toUpperCase() || 'ASC';
    queryBuilder.orderBy(sortBy, sortDirection as 'ASC' | 'DESC');

    // Apply pagination
    queryBuilder.skip((query.pageNumber - 1) * query.pageSize);
    queryBuilder.take(query.pageSize);

    // Fetch paginated users
    const [users, totalCount] = await queryBuilder.getManyAndCount();

    // Map the users to the SQL View DTO
    const items = users.map(UserSQLViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
