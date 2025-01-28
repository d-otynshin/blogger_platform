import { Session } from '../../domain/session.entity';

export class SessionOutputDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(session: any): SessionOutputDto {
    const dto = new SessionOutputDto();

    dto.deviceId = session.deviceId;
    dto.ip = session.ip;
    dto.lastActiveDate = new Date(Number(session.iat) * 1000).toISOString();
    dto.title = session.title;

    return dto;
  }
}

export class SessionSQLOutputDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(session: Session): SessionSQLOutputDto {
    const dto = new SessionOutputDto();

    dto.deviceId = session.device_id;
    dto.ip = session.ip;
    dto.lastActiveDate = new Date(Number(session.iat) * 1000).toISOString();
    dto.title = session.title;

    return dto;
  }
}
