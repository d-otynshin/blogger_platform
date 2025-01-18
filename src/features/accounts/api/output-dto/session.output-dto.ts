import { SessionDocument } from '../../domain/session.entity';

export class SessionOutputDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(session: SessionDocument): SessionOutputDto {
    const dto = new this();

    dto.ip = session.ip;
    dto.title = session.title;
    dto.lastActiveDate = session.exp;
    dto.deviceId = session.deviceId;

    return dto;
  }
}
