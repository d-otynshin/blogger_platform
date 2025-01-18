import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {
  Session,
  SessionDocument,
  SessionModelType,
} from '../../domain/session.entity';
import { SessionDto } from '../../dto/session-dto';

export class SecurityRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async getSessions(userId: string) {
    return this.SessionModel.find({ userId: new Types.ObjectId(userId) });
  }

  async getSession(deviceId: string) {
    return this.SessionModel.findOne({ deviceId });
  }

  async terminateSessions(deviceId: string): Promise<boolean> {
    const deleteResult = await this.SessionModel.deleteMany({
      deviceId: { $ne: deviceId },
    });

    return deleteResult.deletedCount > 0;
  }

  async terminateBySessionId(deviceId: string): Promise<boolean> {
    const deleteResult = await this.SessionModel.deleteOne({ deviceId });

    return deleteResult.deletedCount === 1;
  }

  async updateSession(deviceId: string, iat: string) {
    return this.SessionModel.updateOne({ deviceId }, { $set: { iat } });
  }

  async createSession(session: SessionDto) {
    return this.SessionModel.createInstance(session);
  }

  async save(session: SessionDocument) {
    await session.save();
  }
}
