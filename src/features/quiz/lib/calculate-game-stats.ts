import { GameViewDto } from '../dto/game-view.dto';

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
