export class RecordAnswerDto {
  gameId: string;
  userId: string;
  questionId: string;
  isCorrect: boolean;
  bonus: number;
  points: number;
  addedAt: Date;
}
