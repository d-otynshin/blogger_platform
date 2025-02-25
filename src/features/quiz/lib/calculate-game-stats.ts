import { GameViewDto } from '../dto/game-view.dto';
import { TPlayer } from '../dto/progress-player';

export const calculateGameStats = (games: GameViewDto[], userId: string) => {
  let totalScore = 0;
  let gamesCount = 0;
  let winsCount = 0;
  let lossesCount = 0;
  let drawsCount = 0;

  for (const game of games) {
    // Identify the player and opponent in the game
    const isFirstPlayer = game.firstPlayerProgress.player.id === userId;

    const userProgress = isFirstPlayer
      ? game.firstPlayerProgress
      : game.secondPlayerProgress;
    const opponentProgress = isFirstPlayer
      ? game.secondPlayerProgress
      : game.firstPlayerProgress;

    totalScore += userProgress.score;
    gamesCount++;

    // Determine the outcome of the game
    if (userProgress.score > opponentProgress.score) {
      winsCount++;
    } else if (userProgress.score < opponentProgress.score) {
      lossesCount++;
    } else {
      drawsCount++;
    }
  }

  const averageScore = gamesCount > 0 ? totalScore / gamesCount : 0;
  const formattedAvgScore =
    gamesCount > 0 ? parseFloat(averageScore.toFixed(2)) : 0;

  return {
    avgScores: formattedAvgScore,
    sumScore: totalScore,
    gamesCount,
    winsCount,
    lossesCount,
    drawsCount,
  };
};

interface GameStats {
  totalScore: number;
  gamesCount: number;
  winsCount: number;
  lossesCount: number;
  drawsCount: number;
  player: TPlayer;
}

export const calculateStatsForAllUsers = (games: GameViewDto[]) => {
  const userStats: Record<string, GameStats> = {};

  for (const game of games) {
    const { firstPlayerProgress, secondPlayerProgress } = game;

    const players = [
      {
        user: firstPlayerProgress.player,
        score: firstPlayerProgress.score,
        opponentScore: secondPlayerProgress.score,
      },
      {
        user: secondPlayerProgress.player,
        score: secondPlayerProgress.score,
        opponentScore: firstPlayerProgress.score,
      },
    ];

    for (const { user, score, opponentScore } of players) {
      if (!userStats[user.id]) {
        userStats[user.id] = {
          totalScore: 0,
          gamesCount: 0,
          winsCount: 0,
          lossesCount: 0,
          drawsCount: 0,
          player: user,
        };
      }

      userStats[user.id].totalScore += score;
      userStats[user.id].gamesCount++;

      if (score > opponentScore) {
        userStats[user.id].winsCount++;
      } else if (score < opponentScore) {
        userStats[user.id].lossesCount++;
      } else {
        userStats[user.id].drawsCount++;
      }
    }
  }

  const formatAverageScore = (stats: GameStats) => {
    return stats.gamesCount > 0
      ? parseFloat((stats.totalScore / stats.gamesCount).toFixed(2))
      : 0;
  };

  // Convert stats to final result with avgScore formatted
  return Object.values(userStats).map((stats) => ({
    player: stats.player,
    averageScore: formatAverageScore(stats),
    totalScore: stats.totalScore,
    gamesCount: stats.gamesCount,
    winsCount: stats.winsCount,
    lossesCount: stats.lossesCount,
    drawsCount: stats.drawsCount,
  }));
};
