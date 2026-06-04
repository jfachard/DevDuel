const questions = require('./questions');

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const sanitize = (str, maxLen = 20) =>
  String(str ?? '').trim().slice(0, maxLen).replace(/[<>"'&]/g, '');

class GameManager {
  constructor() {
    this.games   = new Map(); // gameId -> gameState
    this.players = new Map(); // socketId -> { gameId }
  }

  _generateId() {
    let id;
    do {
      id = Array.from({ length: 6 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
    } while (this.games.has(id));
    return id;
  }

  async createGame(hostId, category = 'Code', rawUsername = 'Player') {
    const username = sanitize(rawUsername) || 'Player';
    const gameId   = this._generateId();
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

  joinGame(gameId, playerId, rawUsername = 'Player') {
    const game = this.games.get(gameId);
    if (!game)                                  return null;
    if (game.status !== 'waiting')              return null;
    if (Object.keys(game.players).length >= 2)  return null;

    const username = sanitize(rawUsername) || 'Player';

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
    if (!player)                          return null;
    if (game.answeredPlayers.has(playerId)) return null;

    // Validate index
    const optCount = game.currentQuestion?.options?.length ?? 0;
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= optCount) return null;

    const isCorrect   = answerIndex === game.currentQuestion.correctAnswer;
    const opponentId  = Object.keys(game.players).find(id => id !== playerId);
    const opponent    = game.players[opponentId];

    game.answeredPlayers.add(playerId);
    player.totalQuestions += 1;

    if (isCorrect) {
      player.score         += 100;
      player.correctAnswers += 1;
      if (opponent) {
        opponent.health = Math.max(0, opponent.health - 20);
        if (opponent.health === 0) {
          game.status = 'finished';
          game.winner = playerId;
        }
      }
      // Lock the round so the opponent can't answer the same question
      for (const id of Object.keys(game.players)) game.answeredPlayers.add(id);
    } else {
      player.health = Math.max(0, player.health - 10);
      if (player.health === 0) {
        game.status = 'finished';
        game.winner = opponentId ?? null;
      }
    }

    // Advance when both have answered AND game isn't over
    const roundOver = game.answeredPlayers.size >= Object.keys(game.players).length
                   && game.status !== 'finished';

    return { game: this._serialize(game), roundOver };
  }

  async nextQuestion(gameId) {
    const game = this.games.get(gameId);
    if (!game || game.status === 'finished') return null;
    game.currentQuestion = await questions.getRandomQuestion(game.category, game.currentQuestion?.id);
    game.answeredPlayers.clear();
    return this._serialize(game);
  }

  // Returns serialized final state + opponent id so server can notify them
  removePlayer(playerId) {
    const info = this.players.get(playerId);
    if (!info) return null;

    const game = this.games.get(info.gameId);
    let result = null;

    if (game) {
      const opponentId = Object.keys(game.players).find(id => id !== playerId);
      if (game.status === 'playing' && opponentId) {
        game.status = 'finished';
        game.winner = opponentId;
        result = { gameId: info.gameId, game: this._serialize(game) };
      }
      delete game.players[playerId];
      if (Object.keys(game.players).length === 0) this.games.delete(info.gameId);
    }

    this.players.delete(playerId);
    return result;
  }

  _serialize(game) {
    // eslint-disable-next-line no-unused-vars
    const { answeredPlayers, ...rest } = game;
    return rest;
  }
}

module.exports = new GameManager();
