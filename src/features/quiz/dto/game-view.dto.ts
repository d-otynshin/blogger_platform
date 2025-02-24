import { GameStatus } from '../domain/game.entity';
import { TProgressPlayer } from './progress-player';
import { TQuestion } from './question';

export class GameViewDto {
  id: string;
  firstPlayerProgress: TProgressPlayer;
  secondPlayerProgress: TProgressPlayer;
  questions: TQuestion[];
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;

  static mapToView(gameData: any): GameViewDto {
    const dto = new GameViewDto();

    const playerProgresses = {};
    const questions = new Map();

    // SORTED GUQS
    const guqs = gameData.games_users_questions.sort(
      (a, b) => a.created_at - b.created_at,
    );

    guqs.forEach((entry: any) => {
      const playerId = entry.user.id;

      if (!playerProgresses[playerId]) {
        playerProgresses[playerId] = {
          player: {
            id: playerId,
            login: entry.user.login,
          },
          answers: [],
          score: 0,
        };
      }

      if (!questions.has(entry.question.id)) {
        questions.set(entry.question.id, {
          id: entry.question.id,
          body: entry.question.body,
          createdAt: entry.question.created_at,
        });
      }

      const detectCorrectAnswer = (points: number) => {
        if (points === 2) return 'Incorrect';

        return points ? 'Correct' : 'Incorrect';
      };

      if (entry.answered_at) {
        playerProgresses[playerId].answers.push({
          questionId: entry.question.id,
          addedAt: entry.answered_at,
          answerStatus: detectCorrectAnswer(entry.points),
        });

        if (entry.points) {
          let pointsToAdd: number;

          if (gameData.status === GameStatus.FINISHED) {
            pointsToAdd = [3, 2].includes(Number(entry.points))
              ? entry.points - 1
              : entry.points;
          } else {
            pointsToAdd = [3, 2].includes(Number(entry.points))
              ? entry.points - 2
              : entry.points;
          }

          playerProgresses[playerId].score += pointsToAdd;
        }
      }
    });

    console.log('GAME_DATA', gameData);

    dto.id = String(gameData.id);
    dto.status = gameData.status;
    dto.pairCreatedDate = gameData.created_at;
    dto.finishGameDate = gameData.finished_at;
    dto.startGameDate = gameData.started_at;
    dto.questions = Array.from(questions.values())
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((qn) => ({ id: qn.id, body: qn.body }));
    dto.firstPlayerProgress = null;
    dto.secondPlayerProgress = null;

    if (Object.values(playerProgresses).length === 1) {
      dto.questions = null;
    }

    Object.values(playerProgresses).forEach((entry: any, index) => {
      // SORTED ANSWERS
      const sortedAnswers = entry.answers.sort((a, b) => a.addedAt - b.addedAt);
      const modifiedEntry = {
        ...entry,
        answers: sortedAnswers,
      };

      if (index === 0) {
        dto.firstPlayerProgress = modifiedEntry;
      }

      if (index === 1) {
        dto.secondPlayerProgress = modifiedEntry;
      }
    });

    return dto;
  }
}
