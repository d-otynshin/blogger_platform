import {
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { UserSQLViewDto } from './output-dto/user.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';

import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';
import { UsersSQLQueryRepository } from '../infrastructure/queries/users-sql.query-repository';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private usersSQLQueryRepository: UsersSQLQueryRepository,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserSQLViewDto[]>> {
    return this.usersSQLQueryRepository.getAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserInputDto,
  ): Promise<UserSQLViewDto> {
    const userData = await this.usersService.createUser(createUserDto);

    return UserSQLViewDto.mapToView(userData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const isDeleted = await this.usersService.deleteUser(id);

    if (!isDeleted) {
      throw NotFoundDomainException.create('User not found');
    }

    return;
  }
}
