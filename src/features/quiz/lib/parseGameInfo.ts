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
        answerStatus: entry.is_correct ? 'Correct' : 'Incorrect',
      });

      if (entry.is_correct) {
        playerProgresses[playerId].score += 1;
      }
    }
  });

  const gameViewDto: any = {
    id: gameData.id,
    status: gameData.status,
    pairCreatedDate: gameData.created_at,
    updatedAt: gameData.updated_at,
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
