import { GameViewDto } from './game-view.dto';
import { TPlayer } from './progress-player';

export class StatsViewDto {
  sumScore = 0;
  gamesCount = 0;
  winsCount = 0;
  lossesCount = 0;
  drawsCount = 0;
  avgScores = 0;
  player: TPlayer; // ?

  static mapToView(games: GameViewDto[], userId: string): StatsViewDto {
    const dto = new StatsViewDto();

    for (const game of games) {
      const isFirstPlayer = game.firstPlayerProgress.player.id === userId;

      const userProgress = isFirstPlayer
        ? game.firstPlayerProgress
        : game.secondPlayerProgress;
      const opponentProgress = isFirstPlayer
        ? game.secondPlayerProgress
        : game.firstPlayerProgress;

      dto.sumScore += userProgress.score;
      dto.gamesCount++;

      if (userProgress.score > opponentProgress.score) {
        dto.winsCount++;
      } else if (userProgress.score < opponentProgress.score) {
        dto.lossesCount++;
      } else {
        dto.drawsCount++;
      }
    }

    const averageScore = dto.gamesCount > 0 ? dto.sumScore / dto.gamesCount : 0;

    dto.avgScores =
      dto.gamesCount > 0 ? parseFloat(averageScore.toFixed(2)) : 0;

    return dto;
  }
}
