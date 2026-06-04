import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { GameState, GameContextType } from '../types';
import { useSocket } from '../hooks/useSocket';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket, connected } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(socket.id ?? null);

  useEffect(() => {
    const onConnect = () => setPlayerId(socket.id ?? null);
    const onGameUpdate = (state: GameState) => setGameState(state);

    socket.on('connect', onConnect);
    socket.on('game_update', onGameUpdate);

    // Handle case where socket was already connected before this effect ran
    if (socket.connected && socket.id) setPlayerId(socket.id);

    return () => {
      socket.off('connect', onConnect);
      socket.off('game_update', onGameUpdate);
    };
  }, [socket]);

  const createGame = (category: string, username: string) => {
    if (!socket.connected) return;
    socket.emit('create_game', { category, username });
  };

  const joinGame = (gameId: string, username: string) => {
    if (!socket.connected) return;
    socket.emit('join_game', { gameId, username });
  };

  const submitAnswer = (gameId: string, answerIndex: number) => {
    if (!socket.connected) return;
    socket.emit('submit_answer', { gameId, answerIndex });
  };

  return (
    <GameContext.Provider value={{ gameState, playerId, connected, createGame, joinGame, submitAnswer }}>
      {children}
    </GameContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
