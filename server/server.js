const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors    = require('cors');
const gameManager = require('./gameManager');

const app = express();
app.use(cors());
app.get('/health', (_req, res) => res.sendStatus(200));

const server = http.createServer(app);

const allowedOrigins = [
  'https://dev-duel-five.vercel.app',
  'https://devduel.jfachard.com',
  process.env.CLIENT_URL,
].filter(Boolean);

const io = new Server(server, {
  transports: ['websocket'], // skip HTTP long-polling — required behind Railway's proxy
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
      if (allowedOrigins.some(o => origin === o || origin === o.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create_game', async (data) => {
    const { category = 'Code', username = 'Player' } = data ?? {};
    const gameState = await gameManager.createGame(socket.id, category, username);
    socket.join(gameState.id);
    socket.emit('game_update', gameState);
    console.log(`Game ${gameState.id} created by "${username}" (${category})`);
  });

  socket.on('join_game', (data) => {
    const { gameId, username = 'Player' } = data ?? {};
    const gameState = gameManager.joinGame(gameId, socket.id, username);
    if (gameState) {
      socket.join(gameId);
      io.to(gameId).emit('game_update', gameState);
      console.log(`"${username}" joined game ${gameId}`);
    } else {
      socket.emit('game_error', 'Game not found or already full.');
    }
  });

  socket.on('submit_answer', async ({ gameId, answerIndex }) => {
    const result = await gameManager.submitAnswer(gameId, socket.id, answerIndex);
    if (!result) return;

    const { game, roundOver } = result;
    io.to(gameId).emit('game_update', game);

    if (roundOver) {
      setTimeout(async () => {
        const next = await gameManager.nextQuestion(gameId);
        if (next) io.to(gameId).emit('game_update', next);
      }, 2000);
    }
  });

  socket.on('leave_game', (gameId) => {
    const result = gameManager.removePlayer(socket.id);
    socket.leave(gameId);
    // If the game was in progress, tell the opponent they won
    if (result?.game) {
      io.to(result.gameId).emit('game_update', result.game);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const result = gameManager.removePlayer(socket.id);
    if (result?.game) {
      io.to(result.gameId).emit('game_update', result.game);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
