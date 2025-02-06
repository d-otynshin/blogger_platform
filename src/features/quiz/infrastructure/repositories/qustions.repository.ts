import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../../domain/question.entity';
import { CreateQuestionDto } from '../../dto/question.dto';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private questionsTypeOrmRepository: Repository<Question>,
  ) {}

  async createInstance(dto: CreateQuestionDto) {
    const question = this.questionsTypeOrmRepository.create({
      body: dto.body,
      correct_answers: dto.correctAnswers,
    });

    return this.questionsTypeOrmRepository.save(question);
  }

  async deleteInstance(id: string): Promise<boolean> {
    const deleteResult = await this.questionsTypeOrmRepository.delete(id);

    return deleteResult.affected > 0;
  }

  async findById(id: string) {
    return this.questionsTypeOrmRepository.findOne({ where: { id } });
  }

  async updateInstance(questionId: string, dto: CreateQuestionDto) {
    const updateResult = await this.questionsTypeOrmRepository
      .createQueryBuilder()
      .update(Question)
      .set({ body: dto.body, correct_answers: dto.correctAnswers })
      .where('id = :id', { id: questionId })
      .execute();

    return updateResult.affected > 0;
  }

  async publish(questionId: string) {
    const updateResult = await this.questionsTypeOrmRepository
      .createQueryBuilder()
      .update(Question)
      .set({ published: true })
      .where('id = :id', { id: questionId })
      .execute();

    return updateResult.affected > 0;
  }

  async deleteAll() {
    const deleteResult = await this.questionsTypeOrmRepository.delete({});

    return deleteResult.affected > 0;
  }
}
