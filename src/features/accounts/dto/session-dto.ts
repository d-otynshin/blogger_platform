import { Types } from 'mongoose';

export class SessionDto {
  userId: Types.ObjectId;
  deviceId: string;
  ip: string;
  title: string;
  exp: string;
  iat: string;
}

export class RefreshTokenDto {
  id: string;
  deviceId: string;
  iat: string;
}
