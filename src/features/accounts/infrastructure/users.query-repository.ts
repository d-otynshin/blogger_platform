import { DeletionStatus, User, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { UserViewDto } from '../api/output-dto/user.view-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params.input-dto';

export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findOne({
      _id: id,
      deletionStatus: DeletionStatus.NotDeleted,
    }).exec();

    if (!user) {
      throw new NotFoundException('user not found');
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {};

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find({
      ...filter,
      deletionStatus: DeletionStatus.NotDeleted,
    })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
