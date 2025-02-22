export const parseGameInfo = (gameData: any) => {
  const playerProgresses = {};

  gameData.games_users_questions.forEach((entry: any) => {
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

    if (entry.answered_at) {
      playerProgresses[playerId].answers.push({
        questionId: entry.question.id,
        addedAt: entry.answered_at,
        answerStatus: entry.points ? 'Correct' : 'Incorrect',
      });

      if (entry.points) {
        playerProgresses[playerId].score += entry.points;
      }
    }
  });

  const gameViewDto: any = {
    id: String(gameData.id),
    status: gameData.status,
    pairCreatedDate: gameData.created_at,
    updatedAt: gameData.updated_at,
    finishGameDate: gameData.finish_at,
    startGameDate: gameData.start_at,
    questions: null, // Change
  };

  Object.values(playerProgresses).forEach((entry: any, index) => {
    if (index === 0) {
      gameViewDto.firstPlayerProgress = entry;
    }

    if (index === 1) {
      gameViewDto.secondPlayerProgress = entry;
    }
  });

  return gameViewDto;
};
