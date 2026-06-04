import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { GameState, GameContextType } from '../types';
import { useSocket } from '../hooks/useSocket';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket, connected } = useSocket();

  // Lazy initializer avoids calling setState directly inside an effect
  const [playerId, setPlayerId] = useState<string | null>(() => socket.id ?? null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    const onConnect    = () => setPlayerId(socket.id ?? null);
    const onGameUpdate = (state: GameState) => { setGameState(state); setError(null); };
    const onGameError  = (msg: string) => setError(msg);

    socket.on('connect',     onConnect);
    socket.on('game_update', onGameUpdate);
    socket.on('game_error',  onGameError);

    return () => {
      socket.off('connect',     onConnect);
      socket.off('game_update', onGameUpdate);
      socket.off('game_error',  onGameError);
    };
  }, [socket]);

  const createGame = (category: string, username: string) => {
    if (!socket.connected) return;
    setError(null);
    socket.emit('create_game', { category, username });
  };

  const joinGame = (gameId: string, username: string) => {
    if (!socket.connected) return;
    setError(null);
    socket.emit('join_game', { gameId, username });
  };

  const leaveGame = () => {
    if (gameState) socket.emit('leave_game', gameState.id);
    setGameState(null);
    setError(null);
  };

  const submitAnswer = (gameId: string, answerIndex: number) => {
    if (!socket.connected) return;
    socket.emit('submit_answer', { gameId, answerIndex });
  };

  return (
    <GameContext.Provider value={{ gameState, playerId, connected, error, createGame, joinGame, leaveGame, submitAnswer }}>
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
