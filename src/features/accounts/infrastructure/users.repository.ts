import { InjectModel } from '@nestjs/mongoose';
import {
  DeletionStatus,
  User,
  UserDocument,
  UserModelType,
} from '../domain/user.entity';
import { Types } from 'mongoose';

export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async findById(id: Types.ObjectId): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      id,
      deletionStatus: { $ne: DeletionStatus.PermanentDeleted },
    });
  }

  async findOne(loginOrEmail: string) {
    return this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  }

  async save(user: UserDocument) {
    await user.save();
  }
}
