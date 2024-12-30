import { Controller, Get, Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './user.view-dto';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }
}
