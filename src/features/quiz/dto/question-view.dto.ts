import { Question } from '../domain/question.entity';

export class QuestionViewDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;

  static mapToView(question: Question): QuestionViewDto {
    const dto = new QuestionViewDto();

    dto.id = question.id;
    dto.body = question.body;
    dto.correctAnswers = question.correct_answers;
    dto.createdAt = question.created_at;
    dto.updatedAt = question.updated_at;
    dto.published = question.published;

    return dto;
  }
}
