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
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('create_game', () => {
    const gameState = gameManager.createGame(socket.id);
    socket.join(gameState.id);
    socket.emit('game_update', gameState);
    console.log(`Game created: ${gameState.id} by ${socket.id}`);
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

  socket.on('submit_answer', ({ gameId, answerIndex }) => {
    const gameState = gameManager.submitAnswer(gameId, socket.id, answerIndex);
    if (gameState) {
      io.to(gameId).emit('game_update', gameState);
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
