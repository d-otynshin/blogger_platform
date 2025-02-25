export class RecordAnswerDto {
  gameId: number;
  userId: string;
  questionId: number;
  isCorrect: boolean;
  bonus: number;
  points: number;
  addedAt: Date;
}
