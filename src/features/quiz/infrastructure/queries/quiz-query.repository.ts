import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../accounts/domain/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(User)
    private questionsTypeOrmRepository: Repository<User>,
  ) {}

  async findAll() {

  }
}
