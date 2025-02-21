export const parseGameInfo = (gameData: any) => {
  const groupedData = {};

  gameData.games_users_questions.forEach((entry: any) => {
    const playerId = entry.user.id;
    if (!groupedData[playerId]) {
      groupedData[playerId] = {
        player: {
          id: playerId,
          login: entry.user.login,
          email: entry.user.email,
        },
        questions: [],
      };
    }

    groupedData[playerId].questions.push({
      question: entry.question.body,
      answeredAt: entry.answered_at,
      isCorrect: entry.is_correct,
    });
  });

  return {
    gameId: gameData.id,
    status: gameData.status,
    createdAt: gameData.created_at,
    updatedAt: gameData.updated_at,
    players: Object.values(groupedData),
  };
}
