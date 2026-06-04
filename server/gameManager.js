const questions = require('./questions');

class GameManager {
  constructor() {
    this.games = new Map();   // gameId -> gameState
    this.players = new Map(); // socketId -> { gameId }
  }

  async createGame(hostId, category = 'Code', username = 'Player') {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const firstQuestion = await questions.getRandomQuestion(category);

    const gameState = {
      id: gameId,
      status: 'waiting',
      category,
      players: {
        [hostId]: {
          id: hostId,
          name: username,
          score: 0,
          health: 100,
          isHost: true,
          correctAnswers: 0,
          totalQuestions: 0,
        },
      },
      currentQuestion: firstQuestion,
      answeredPlayers: new Set(),
    };

    this.games.set(gameId, gameState);
    this.players.set(hostId, { gameId });
    return this._serialize(gameState);
  }

  joinGame(gameId, playerId, username = 'Player') {
    const game = this.games.get(gameId);
    if (!game) return null;
    if (game.status !== 'waiting') return null;
    if (Object.keys(game.players).length >= 2) return null;

    game.players[playerId] = {
      id: playerId,
      name: username,
      score: 0,
      health: 100,
      isHost: false,
      correctAnswers: 0,
      totalQuestions: 0,
    };

    this.players.set(playerId, { gameId });
    game.status = 'playing';

    return this._serialize(game);
  }

  async submitAnswer(gameId, playerId, answerIndex) {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'playing') return null;

    const player = game.players[playerId];
    if (!player) return null;
    if (game.answeredPlayers.has(playerId)) return null;

    const isCorrect = answerIndex === game.currentQuestion.correctAnswer;
    const opponentId = Object.keys(game.players).find(id => id !== playerId);
    const opponent = game.players[opponentId];

    game.answeredPlayers.add(playerId);
    player.totalQuestions += 1;
    let roundOver = false;

    if (isCorrect) {
      player.score += 100;
      player.correctAnswers += 1;
      if (opponent) {
        opponent.health = Math.max(0, opponent.health - 20);
        if (opponent.health === 0) {
          game.status = 'finished';
          game.winner = playerId;
        }
      }
      // Advance immediately on correct answer
      if (game.status !== 'finished') {
        game.currentQuestion = await questions.getRandomQuestion(game.category, game.currentQuestion.id);
        game.answeredPlayers.clear();
      }
    } else {
      player.health = Math.max(0, player.health - 10);
      if (player.health === 0) {
        game.status = 'finished';
        game.winner = opponentId;
      }
      // If both answered wrong, advance after a delay
      if (game.answeredPlayers.size === 2) {
        roundOver = true;
      }
    }

    return { game: this._serialize(game), roundOver };
  }

  async nextQuestion(gameId) {
    const game = this.games.get(gameId);
    if (!game) return null;
    game.currentQuestion = await questions.getRandomQuestion(game.category, game.currentQuestion.id);
    game.answeredPlayers.clear();
    return this._serialize(game);
  }

  removePlayer(playerId) {
    const info = this.players.get(playerId);
    if (!info) return;
    const game = this.games.get(info.gameId);
    if (game) {
      delete game.players[playerId];
      if (Object.keys(game.players).length === 0) {
        this.games.delete(info.gameId);
      }
    }
    this.players.delete(playerId);
  }

  // Strip the Set before sending over the wire (Sets serialize as {})
  _serialize(game) {
    return { ...game, answeredPlayers: undefined };
  }
}

module.exports = new GameManager();
