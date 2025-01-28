export class SessionDto {
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  iat: number;
}

export class RefreshTokenDto {
  id: string;
  deviceId: string;
  iat: number;
}
