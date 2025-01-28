import { Repository } from 'typeorm';
import { CreateUserDbDto } from '../../dto/create-user-dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private usersTypeOrmRepository: Repository<User>,
  ) {}

  async createInstance(dto: CreateUserDbDto) {
    const user = this.usersTypeOrmRepository.create({
      email: dto.email,
      login: dto.login,
      password_hash: dto.passwordHash,
      confirmation_code: dto.confirmationCode,
    });

    return this.usersTypeOrmRepository.save(user);
  }

  async findById(id: string) {
    return this.usersTypeOrmRepository.findOne({ where: { id } });
  }

  async findOne(loginOrEmail: string) {
    return this.usersTypeOrmRepository.findOne({
      where: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  }

  async deleteInstance(id: string): Promise<boolean> {
    const result = await this.usersTypeOrmRepository.delete(id);

    return result.affected > 0;
  }

  async updateConfirmationCode(
    userId: string,
    updatedConfirmationCode: string,
  ): Promise<boolean> {
    const updateResult = await this.usersTypeOrmRepository
      .createQueryBuilder()
      .update(User)
      .set({ confirmation_code: updatedConfirmationCode })
      .where('id = :id', { id: userId })
      .execute();

    return updateResult.affected > 0;
  }

  async updateConfirmationStatus(
    userId: string,
    isConfirmed: boolean,
  ): Promise<boolean> {
    const updateResult = await this.usersTypeOrmRepository
      .createQueryBuilder()
      .update(User)
      .set({ is_confirmed: isConfirmed })
      .where('id = :id', { id: userId })
      .execute();

    return updateResult.affected > 0;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const updateResult = await this.usersTypeOrmRepository
      .createQueryBuilder()
      .update(User)
      .set({ password_hash: passwordHash })
      .where('id = :id', { id: userId })
      .execute();

    return updateResult.affected > 0;
  }

  async updateUserEmail(userId: string, email: string) {
    const result = await this.usersTypeOrmRepository
      .createQueryBuilder()
      .update(User)
      .set({ email })
      .where('id = :id', { id: userId })
      .execute();

    return result.affected > 0;
  }

  async deleteAll() {
    const result = await this.usersTypeOrmRepository.delete({});

    return result.affected > 0;
  }
}
