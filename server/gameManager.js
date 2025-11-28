const questions = require('./questions');

class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> gameState
    this.players = new Map(); // socketId -> { gameId, playerId }
  }

  async createGame(hostId, category = 'Code') {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const firstQuestion = await questions.getRandomQuestion(category);
    
    const gameState = {
      id: gameId,
      status: 'waiting', // waiting, playing, finished
      category: category,
      players: {
        [hostId]: {
          id: hostId,
          score: 0,
          health: 100,
          isHost: true
        }
      },
      currentQuestion: firstQuestion,
      answeredPlayers: new Set()
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

  async submitAnswer(gameId, playerId, answerIndex) {
    const game = this.games.get(gameId);
    if (!game || game.status !== 'playing') return null;

    const player = game.players[playerId];
    if (!player) return null;

    // Prevent answering twice for the same question
    if (game.answeredPlayers.has(playerId)) return null;

    const isCorrect = answerIndex === game.currentQuestion.correctAnswer;
    const opponentId = Object.keys(game.players).find(id => id !== playerId);
    const opponent = game.players[opponentId];

    game.answeredPlayers.add(playerId);
    let roundOver = false;

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
      roundOver = true;
    } else {
      // Incorrect answer: Damage self
      player.health -= 10;
      if (player.health <= 0) {
        player.health = 0;
        game.status = 'finished';
        game.winner = opponentId;
      }

      // Check if both players have answered incorrectly
      if (game.answeredPlayers.size === 2) {
        roundOver = true;
      }
    }

    // If round is over immediately (correct answer) or delayed (double wrong), 
    // we return the state. The caller (server.js) handles the delay/next question.
    // BUT, if roundOver is true immediately (correct answer), we usually want to fetch next question immediately?
    // The previous logic was: correct -> immediate next question.
    // Let's keep it consistent.

    if (isCorrect) {
       game.currentQuestion = await questions.getRandomQuestion(game.category, game.currentQuestion.id);
       game.answeredPlayers.clear();
       roundOver = false; // We already advanced, so no need for delayed advance
    }

    return { game, roundOver };
  }

  async nextQuestion(gameId) {
    const game = this.games.get(gameId);
    if (!game) return null;

    game.currentQuestion = await questions.getRandomQuestion(game.category, game.currentQuestion.id);
    game.answeredPlayers.clear();
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
