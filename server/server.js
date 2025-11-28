const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameManager = require('./gameManager');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
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
