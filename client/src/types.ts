export interface Player {
  id: string;
  name: string;
  score: number;
  health: number;
  isHost: boolean;
  correctAnswers: number;
  totalQuestions: number;
}

export interface GameState {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  category?: string;
  players: Record<string, Player>;
  currentQuestion: Question | null;
  winner?: string | null;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export type GameContextType = {
  gameState: GameState | null;
  playerId: string | null;
  connected: boolean;
  error: string | null;
  createGame: (category: string, username: string) => void;
  joinGame: (gameId: string, username: string) => void;
  leaveGame: () => void;
  submitAnswer: (gameId: string, answerIndex: number) => void;
};
