export const parseGameInfo = (gameData: any) => {
  const playerProgresses = {};
  const questions = new Map();

  console.log('parseGameInfo', gameData);

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

    if (!questions.has(entry.question.id)) {
      questions.set(entry.question.id, {
        id: entry.question.id,
        body: entry.question.body,
      });
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
    finishGameDate: gameData.finished_at,
    startGameDate: gameData.started_at,
    questions: Array.from(questions.values()),
    firstPlayerProgress: null,
    secondPlayerProgress: null,
  };

  console.log('GAME View QNS', questions);

  if (Object.values(playerProgresses).length === 1) {
    gameViewDto.questions = null;
  }

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
