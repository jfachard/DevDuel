import React from "react";
import { useGame } from "../context/GameContext";

export const GameOver: React.FC = () => {
  const { gameState, playerId } = useGame();

  if (!gameState) return null;

  const players = Object.values(gameState.players);
  // Find our player by id; fall back to first player if playerId not resolved yet
  const myPlayer = players.find((p) => p.id === playerId) ?? players[0];
  const winnerPlayer = gameState.winner ? gameState.players[gameState.winner] : null;

  if (!myPlayer) return null;

  const isWinner = gameState.winner === playerId;
  const winnerName = winnerPlayer?.name ?? 'Unknown';
  const accuracy =
    myPlayer.totalQuestions > 0
      ? Math.round((myPlayer.correctAnswers / myPlayer.totalQuestions) * 100)
      : 0;

  const resultColor = isWinner ? '#00FF41' : '#ff4d6d';
  const resultGlow = isWinner
    ? '0 0 30px rgba(0, 255, 65, 0.6), 0 0 70px rgba(0, 255, 65, 0.25)'
    : '0 0 30px rgba(255, 77, 109, 0.6), 0 0 70px rgba(255, 77, 109, 0.25)';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg animate-fade-in space-y-6">
      {/* Result title */}
      <div className="text-center space-y-2">
        <h1
          className="text-7xl font-black uppercase tracking-widest"
          style={{ color: resultColor, textShadow: resultGlow }}
        >
          {isWinner ? 'VICTORY' : 'DEFEAT'}
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {isWinner ? 'Match terminated — Opponent defeated' : 'Match terminated — You were defeated'}
        </p>
      </div>

      {/* Stats panel */}
      <div
        className="w-full rounded-2xl p-6 space-y-4 animate-slide-up"
        style={{
          background: '#0d1b2a',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          animationDelay: '0.15s',
        }}
      >
        {/* Winner row */}
        <div
          className="flex items-center space-x-3 p-3 rounded-xl"
          style={{ background: '#020617', border: '1px solid rgba(0, 229, 255, 0.1)' }}
        >
          <div
            className="w-9 h-9 flex items-center justify-center rounded-lg font-mono text-xs font-black flex-shrink-0"
            style={{ background: 'rgba(0, 229, 255, 0.08)', color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.2)' }}
          >
            &gt;_
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Winner</p>
            <p className="font-mono font-black text-white">
              {winnerName}{isWinner ? ' (You)' : ''}
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Final Score',  value: `${myPlayer.score}`,   unit: 'pts', color: '#00E5FF' },
            { label: 'Accuracy',     value: `${accuracy}%`,        unit: '',    color: '#BD00FF' },
            { label: 'Remaining HP', value: `${myPlayer.health}%`, unit: '',    color: myPlayer.health > 50 ? '#00FF41' : '#ff4d6d' },
          ].map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="p-4 rounded-xl text-center space-y-1"
              style={{ background: '#020617', border: '1px solid rgba(0, 229, 255, 0.1)' }}
            >
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(0, 229, 255, 0.45)' }}>
                {label}
              </p>
              <p className="text-2xl font-black font-mono" style={{ color }}>{value}</p>
              {unit && <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>{unit}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div
        className="flex space-x-3 w-full animate-slide-up"
        style={{ animationDelay: '0.3s' }}
      >
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest font-mono transition-all hover:brightness-110 active:scale-95"
          style={{ background: '#00E5FF', color: '#020617', boxShadow: '0 0 30px rgba(0, 229, 255, 0.2)' }}
        >
          Play Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-4 rounded-xl font-black text-sm uppercase tracking-widest font-mono transition-all hover:brightness-125 active:scale-95"
          style={{ background: 'transparent', border: '1px solid rgba(0, 229, 255, 0.35)', color: '#00E5FF' }}
        >
          Return to Lobby
        </button>
      </div>
    </div>
  );
};
