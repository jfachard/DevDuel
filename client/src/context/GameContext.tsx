import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { GameState, GameContextType } from '../types';
import { useSocket } from '../hooks/useSocket';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
      setPlayerId(socket.id || null);
    });

    socket.on('game_update', (newGameState: GameState) => {
      console.log('Game update received:', newGameState);
      setGameState(newGameState);
    });

    return () => {
      socket.off('connect');
      socket.off('game_update');
    };
  }, [socket]);

  const createGame = (category: string = 'Code') => {
    console.log('createGame called. Socket:', socket?.id);
    if (socket) {
      socket.emit('create_game', category);
      console.log('Emitted create_game event');
    } else {
      console.error('Socket not connected');
    }
  };

  const joinGame = (gameId: string) => {
    if (socket) {
      socket.emit('join_game', gameId);
    }
  };

  const submitAnswer = (gameId: string, answerIndex: number) => {
    if (socket) {
      socket.emit('submit_answer', { gameId, answerIndex });
    }
  };

  return (
    <GameContext.Provider value={{ gameState, playerId, createGame, joinGame, submitAnswer }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
