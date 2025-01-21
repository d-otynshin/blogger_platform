import { DataSource } from 'typeorm';
import { CreateUserDbDto } from '../../dto/create-user-dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersPostgresqlRepository {
  constructor(private dataSource: DataSource) {}

  async createInstance(dto: CreateUserDbDto) {
    const uuid = crypto.randomUUID();

    const query = `
      INSERT INTO users (id, email, login, password_hash, confirmation_code, is_confirmed, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await this.dataSource.query(query, [
      uuid,
      dto.email,
      dto.login,
      dto.passwordHash,
      dto.confirmationCode,
      false,
      new Date().toISOString(),
    ]);

    return result[0];
  }

  async findById(id: string) {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await this.dataSource.query(query, [id]);

    return result[0];
  }

  async findOne(loginOrEmail: string) {
    const query = `
        SELECT * FROM users
        WHERE email = $1 OR login = $1
        LIMIT 1
    `;

    const result = await this.dataSource.query(query, [loginOrEmail]);

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }

  async deleteInstance(id: string) {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *`;
    const result = await this.dataSource.query(query, [id]);

    if (result.length > 0) {
      return result[0];
    }

    return null;
  }

  async updateConfirmationCode(
    userId: string,
    updatedConfirmationCode: string,
  ): Promise<boolean> {
    const query = `
    UPDATE users 
    SET confirmation_code = $1 
    WHERE id = $2 
    RETURNING *;
  `;

    const result = await this.dataSource.query(query, [
      updatedConfirmationCode,
      userId,
    ]);

    return result.length > 0;
  }

  async updateConfirmationStatus(
    userId: string,
    isConfirmed: boolean,
  ): Promise<boolean> {
    const query = `
    UPDATE users 
    SET is_confirmed = $1
    WHERE id = $2 
    RETURNING *;
  `;

    const result = await this.dataSource.query(query, [isConfirmed, userId]);

    return result.length > 0;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const query = `
    UPDATE users 
    SET passwordHash = $1 
    WHERE id = $2 
    RETURNING *;
  `;

    const result = await this.dataSource.query(query, [passwordHash, userId]);

    return result.length > 0;
  }

  async updateUserEmail(userId: string, email: string) {
    const query = `
    UPDATE users 
    SET email = $1 
    WHERE id = $2 
    RETURNING *;
  `;

    const result = await this.dataSource.query(query, [email, userId]);

    return result[0];
  }

  async deleteAll() {
    const query = 'DELETE FROM users';
    const result = await this.dataSource.query(query);
    return result.affectedRows > 0;
  }
}
