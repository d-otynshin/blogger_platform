import { Injectable, UseGuards } from '@nestjs/common';
import { CreateQuestionDto, PublishQuestionDto } from '../dto/question.dto';
import { QuestionsRepository } from '../infrastructure/repositories/qustions.repository';
import { BasicAuthGuard } from '../../accounts/guards/basic/basic-auth.guard';
import { NotFoundDomainException } from '../../../core/exceptions/domain-exceptions';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  @UseGuards(BasicAuthGuard)
  async createQuestion(dto: CreateQuestionDto) {
    return await this.questionsRepository.createInstance(dto);
  }

  @UseGuards(BasicAuthGuard)
  async deleteQuestion(id: string): Promise<boolean> {
    const isDeleted = await this.questionsRepository.deleteInstance(id);
    if (!isDeleted) {
      throw NotFoundDomainException.create('Question does not exist');
    }

    return isDeleted;
  }

  @UseGuards(BasicAuthGuard)
  async updateQuestion(id: string, dto: CreateQuestionDto): Promise<boolean> {
    const isUpdated = await this.questionsRepository.updateInstance(id, dto);

    if (!isUpdated) {
      throw NotFoundDomainException.create('Question does not exist');
    }

    return isUpdated;
  }

  @UseGuards(BasicAuthGuard)
  async publishQuestion(id: string, dto: PublishQuestionDto) {
    const isPublished = await this.questionsRepository.publish(id, dto);

    if (!isPublished) {
      throw NotFoundDomainException.create('Question does not exist');
    }

    return isPublished;
  }
}
