import { Length, IsBoolean } from 'class-validator';

export class CreateQuestionDto {
  @Length(10, 500)
  body: string;

  correctAnswers: string[];
}

export class PublishQuestionDto {
  @IsBoolean()
  published: boolean;
}
