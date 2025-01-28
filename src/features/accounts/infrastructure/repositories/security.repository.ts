import { Not, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../../domain/session.entity';
import { SessionDto } from '../../dto/session-dto';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectRepository(Session)
    private sessionTypeOrmRepository: Repository<Session>,
  ) {}

  async createSession(dto: SessionDto) {
    const session = this.sessionTypeOrmRepository.create({
      user_id: dto.userId,
      device_id: dto.deviceId,
      ip: dto.ip,
      title: dto.title,
      iat: dto.iat, // TODO: Convert in transform pipe
    });

    return this.sessionTypeOrmRepository.save(session);
  }

  async getSessions(userId: string) {
    return this.sessionTypeOrmRepository.find({ where: { user_id: userId } });
  }

  async getSession(deviceId: string) {
    return this.sessionTypeOrmRepository.findOne({
      where: { device_id: deviceId },
    });
  }

  async terminateSessions(deviceId: string) {
    const result = await this.sessionTypeOrmRepository.delete({
      device_id: Not(deviceId),
    });

    return result.affected > 0;
  }

  async updateSession(deviceId: string, iat: number): Promise<boolean> {
    const updateResult = await this.sessionTypeOrmRepository
      .createQueryBuilder()
      .update()
      .set({ iat })
      .where({ device_id: deviceId })
      .execute();

    return updateResult.affected > 0;
  }

  async terminateBySessionId(deviceId: string) {
    const deleteResult = await this.sessionTypeOrmRepository.delete({
      device_id: deviceId,
    });

    return deleteResult.affected > 0;
  }

  async deleteAll() {
    const deleteResult = await this.sessionTypeOrmRepository.delete({});

    return deleteResult.affected > 0;
  }
}
