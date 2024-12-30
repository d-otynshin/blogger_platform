import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../accounts/domain/user.entity';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAll() {
    this.UserModel.deleteMany();
  }
}
