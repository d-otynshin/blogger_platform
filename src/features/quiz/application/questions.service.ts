import { Injectable, UseGuards } from '@nestjs/common';
import { CreateQuestionDto } from '../dto/question.dto';
import { QuestionsRepository } from '../infrastructure/repositories/qustions.repository';
import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  @UseGuards(BasicAuthGuard)
  async createQuestion(dto: CreateQuestionDto) {
    return await this.questionsRepository.createInstance(dto);
  }

  @UseGuards(BasicAuthGuard)
  async deleteQuestion(id: string): Promise<boolean> {
    return this.questionsRepository.deleteInstance(id);
  }

  @UseGuards(BasicAuthGuard)
  async updateQuestion(id: string, dto: CreateQuestionDto): Promise<boolean> {
    return this.questionsRepository.updateInstance(id, dto);
  }

  @UseGuards(BasicAuthGuard)
  async publishQuestion(id: string) {
    return this.questionsRepository.publish(id);
  }
}
