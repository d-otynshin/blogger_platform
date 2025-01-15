import { Types } from 'mongoose';

export class LoginDto {
  loginOrEmail: string;
  password: string;
}

export class UserContextDto {
  id: Types.ObjectId;
  login: string;
}
