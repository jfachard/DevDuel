const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameManager = require('./gameManager');

const app = express();
app.use(cors());

const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://dev-duel-five.vercel.app",
  "https://dev-duel-five.vercel.app/", // Handle potential trailing slash
  process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('create_game', async (category) => {
    const gameState = await gameManager.createGame(socket.id, category);
    socket.join(gameState.id);
    socket.emit('game_update', gameState);
    console.log(`Game created: ${gameState.id} by ${socket.id} (Category: ${category})`);
  });

  socket.on('join_game', (gameId) => {
    const gameState = gameManager.joinGame(gameId, socket.id);
    if (gameState) {
      socket.join(gameId);
      io.to(gameId).emit('game_update', gameState);
      console.log(`User ${socket.id} joined game ${gameId}`);
    } else {
      socket.emit('error', 'Could not join game');
    }
  });

  socket.on('submit_answer', async ({ gameId, answerIndex }) => {
    const result = await gameManager.submitAnswer(gameId, socket.id, answerIndex);
    if (result) {
      const { game, roundOver } = result;
      io.to(gameId).emit('game_update', game);

      if (roundOver) {
        setTimeout(async () => {
          const nextGame = await gameManager.nextQuestion(gameId);
          if (nextGame) {
            io.to(gameId).emit('game_update', nextGame);
          }
        }, 2000);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    gameManager.removePlayer(socket.id);
    // TODO: Notify other players in the game
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
