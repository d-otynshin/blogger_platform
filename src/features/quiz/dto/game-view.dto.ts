import { Game, GameStatus } from '../domain/game.entity';
import { TProgressPlayer } from './progress-player';
import { TQuestion } from './question';
import { Question } from '../domain/question.entity';

export class GameViewDto {
  id: string;
  firstPlayerProgress: TProgressPlayer;
  secondPlayerProgress: TProgressPlayer;
  questions: TQuestion[];
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;

  static mapToView(game: Game, questions: Question[]): GameViewDto {
    const dto = new GameViewDto();

    dto.id = game.id;
    dto.questions = questions;

    return dto;
  }
}
