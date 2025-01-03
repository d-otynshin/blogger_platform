import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PaginatedViewDto } from '@core/dto/base.paginated.view-dto';
import { UserViewDto } from './user.view-dto';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UsersService } from '../application/users.service';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { Types } from 'mongoose';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserInputDto,
  ): Promise<UserViewDto> {
    return this.usersService.createUser(createUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: Types.ObjectId): Promise<void> {
    return this.usersService.deleteUser(id);
  }
}
