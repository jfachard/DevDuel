const questions = require('./questions');

class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> gameState
    this.players = new Map(); // socketId -> { gameId, playerId }
  }

  createGame(hostId) {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gameState = {
      id: gameId,
      status: 'waiting', // waiting, playing, finished
      players: {
        [hostId]: {
          id: hostId,
          score: 0,
          health: 100,
          isHost: true
        }
      },
      currentQuestion: questions.getRandomQuestion()
    };
    
    this.games.set(gameId, gameState);
    this.players.set(hostId, { gameId, playerId: hostId });
    return gameState;
  }

  joinGame(gameId, playerId) {
    const game = this.games.get(gameId);
    if (!game) return null;
    if (game.status !== 'waiting') return null;
    if (Object.keys(game.players).length >= 2) return null;

    game.players[playerId] = {
      id: playerId,
      score: 0,
      health: 100,
      isHost: false
    };

    this.players.set(playerId, { gameId, playerId });

    if (Object.keys(game.players).length === 2) {
      game.status = 'playing';
    }

    return game;
  }

  submitAnswer(gameId, playerId, answerIndex) {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'playing') return null;

    const player = game.players[playerId];
    if (!player) return null;

    const isCorrect = answerIndex === game.currentQuestion.correctAnswer;
    const opponentId = Object.keys(game.players).find(id => id !== playerId);
    const opponent = game.players[opponentId];

    if (isCorrect) {
      // Correct answer: Damage opponent
      player.score += 10;
      if (opponent) {
        opponent.health -= 20;
        if (opponent.health <= 0) {
          opponent.health = 0;
          game.status = 'finished';
          game.winner = playerId;
        }
      }
      // Get new question
      game.currentQuestion = questions.getRandomQuestion();
    } else {
      // Incorrect answer: Small penalty or just feedback?
      // Let's damage self slightly for wrong answers to discourage spamming
      player.health -= 10;
      if (player.health <= 0) {
        player.health = 0;
        game.status = 'finished';
        game.winner = opponentId;
      }
    }

    return game;
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  removePlayer(playerId) {
    const playerInfo = this.players.get(playerId);
    if (!playerInfo) return;

    const { gameId } = playerInfo;
    const game = this.games.get(gameId);
    
    if (game) {
      delete game.players[playerId];
      if (Object.keys(game.players).length === 0) {
        this.games.delete(gameId);
      }
    }
    this.players.delete(playerId);
  }
}

module.exports = new GameManager();
