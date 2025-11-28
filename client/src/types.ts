export interface Player {
    id: string;
    name?: string;
    score: number;
    health: number;
    isHost: boolean;
}

export interface GameState {
    id: string;
    status: 'waiting' | 'playing' | 'finished';
    players: Record<string, Player>;
    currentQuestion: Question | null;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index of correct option
}

export type GameContextType = {
    gameState: GameState | null;
    playerId: string | null;
    joinGame: (gameId: string) => void;
    createGame: () => void;
};
