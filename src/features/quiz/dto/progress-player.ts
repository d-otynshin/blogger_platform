enum AnswerStatus {
  CORRECT = 'Correct',
  INCORRECT = 'Incorrect',
}

export type TPlayer = {
  id: string;
  login: string;
};

export type TAnswer = {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: string;
};

export type TProgressPlayer = {
  answers: TAnswer[];
  player: TPlayer;
  score: number;
};
