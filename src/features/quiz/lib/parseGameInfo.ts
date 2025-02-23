export const parseGameInfo = (gameData: any) => {
  const playerProgresses = {};
  const questions = new Map();

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
    questions: Array.from(questions.values())
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((qn) => ({ id: qn.id, body: qn.body })),
    firstPlayerProgress: null,
    secondPlayerProgress: null,
  };

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
