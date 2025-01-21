import { SessionDto } from '../../dto/session-dto';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityPostgresqlRepository {
  constructor(private dataSource: DataSource) {}

  async createSession(dto: SessionDto) {
    const query = `
      INSERT INTO sessions ("userId", "deviceId", ip, title, iat)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      dto.userId,
      dto.deviceId,
      dto.ip,
      dto.title,
      dto.iat,
    ]);

    return result[0];
  }

  async getSessions(userId: string) {
    const query = `SELECT * FROM sessions WHERE "userId" = $1`;
    return this.dataSource.query(query, [userId]);
  }

  async getSession(deviceId: string) {
    const query = `SELECT * FROM sessions WHERE "deviceId" = $1`;
    const result = await this.dataSource.query(query, [deviceId]);

    return result[0];
  }

  async terminateSessions(deviceId: string) {
    const query = `DELETE FROM sessions WHERE "deviceId" != $1 RETURNING *`;
    return this.dataSource.query(query, [deviceId]);
  }

  async updateSession(userId: string, iat: string): Promise<boolean> {
    const query = `
    UPDATE sessions 
    SET iat = $1 
    WHERE "userId" = $2 
    RETURNING *;
  `;

    const result = await this.dataSource.query(query, [iat, userId]);

    return result.length > 0;
  }

  async terminateBySessionId(deviceId: string) {
    const query = `DELETE FROM sessions WHERE "deviceId" = $1 RETURNING *`;
    const result = await this.dataSource.query(query, [deviceId]);

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }

  async deleteAll() {
    const query = 'DELETE FROM sessions';
    const result = await this.dataSource.query(query);
    return result.affectedRows > 0;
  }
}
