import { SessionDocument } from '../../domain/session.entity';

export class SessionOutputDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(session: SessionDocument): SessionOutputDto {
    const dto = new SessionOutputDto();

    dto.deviceId = session.deviceId;
    dto.ip = session.ip;
    dto.lastActiveDate = new Date(Number(session.exp) * 1000).toISOString();
    dto.title = session.title;

    return dto;
  }
}
