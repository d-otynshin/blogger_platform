import { InjectModel } from '@nestjs/mongoose';
import {
  DeletionStatus,
  User,
  UserDocument,
  UserModelType,
} from '../../domain/user.entity';
import { Types } from 'mongoose';
import { CreateUserDbDto } from '../../dto/create-user-dto';

export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async createInstance(dto: CreateUserDbDto): Promise<UserDocument> {
    return this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      password: dto.passwordHash,
      confirmationCode: dto.confirmationCode,
    });
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: new Types.ObjectId(id),
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async findOne(loginOrEmail: string) {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async deleteInstance(id: string): Promise<boolean> {
    const deleteResult = await this.UserModel.deleteOne({
      _id: new Types.ObjectId(id),
    });

    return deleteResult.deletedCount === 1;
  }

  async save(user: UserDocument) {
    await user.save();
  }
}
