import React from "react";
import { useGame } from "../context/GameContext";

export const GameOver: React.FC = () => {
  const { gameState, playerId } = useGame();

  if (!gameState) return null;

  const isWinner = gameState.winner === playerId;
  const winnerName =
    gameState.players[gameState.winner || ""]?.id === playerId
      ? "You"
      : "Opponent";
  const player = gameState.players[playerId || ""];
  const accuracy =
    player.totalQuestions > 0
      ? Math.round((player.correctAnswers / player.totalQuestions) * 100)
      : 0;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 bg-gray-800 p-12 rounded-2xl shadow-2xl border border-gray-700 animate-fade-in max-w-lg w-full">
      <h2
        className={`text-6xl font-bold animate-pop ${
          isWinner ? "text-green-400" : "text-red-500"
        }`}
      >
        {isWinner ? "VICTORY!" : "DEFEAT"}
      </h2>

      <div
        className="text-center space-y-2 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <p className="text-2xl text-gray-300">
          Winner: <span className="font-bold text-white">{winnerName}</span>
        </p>
        <p className="text-gray-400 text-sm">Game ID: {gameState.id}</p>
      </div>

      <div
        className="grid grid-cols-3 gap-4 w-full animate-slide-up"
        style={{ animationDelay: "0.3s" }}
      >
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-xs uppercase">Score</p>
          <p className="text-2xl font-bold text-blue-400">{player.score}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-xs uppercase">Accuracy</p>
          <p className="text-2xl font-bold text-purple-400">{accuracy}%</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="text-gray-400 text-xs uppercase">Health</p>
          <p
            className={`text-2xl font-bold ${
              player.health > 50 ? "text-green-400" : "text-red-400"
            }`}
          >
            {player.health}%
          </p>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()} // Simple reload to reset for now
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-xl transition-transform transform hover:scale-105 shadow-lg animate-slide-up w-full"
        style={{ animationDelay: "0.4s" }}
      >
        Play Again
      </button>
    </div>
  );
};
