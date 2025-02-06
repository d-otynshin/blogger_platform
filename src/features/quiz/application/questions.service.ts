import { CreateQuestionDto } from '../dto/question.dto';
import { QuestionsRepository } from '../infrastructure/repositories/qustions.repository';

export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async createQuestion(dto: CreateQuestionDto) {
    return this.questionsRepository.createInstance(dto);
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return this.questionsRepository.deleteInstance(id);
  }

  async updateQuestion(id: string, dto: CreateQuestionDto): Promise<boolean> {
    return this.questionsRepository.updateInstance(id, dto);
  }

  async publishQuestion(id: string) {
    return this.questionsRepository.publish(id);
  }
}
