import React, { useState } from "react";
import { useGame } from "../context/GameContext";

export const Arena: React.FC = () => {
  const { gameState, playerId, submitAnswer, connected } = useGame();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const question = gameState?.currentQuestion;

  React.useEffect(() => {
    if (question?.id) {
      setSelectedOption(null);
    }
  }, [question?.id]);

  if (!gameState || !question) return null;

  const players = Object.values(gameState.players);
  const myPlayer = players.find((p) => p.id === playerId) ?? players[0];
  const opponent = players.find((p) => p.id !== playerId);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (gameState?.id) {
      submitAnswer(gameState.id, index);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl space-y-4 animate-fade-in relative">
      {/* Disconnect overlay */}
      {!connected && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl space-y-3"
          style={{ background: 'rgba(2,6,23,0.88)', backdropFilter: 'blur(4px)' }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ff4d6d', boxShadow: '0 0 8px #ff4d6d' }} />
          <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,77,109,0.8)' }}>
            Connection lost — reconnecting…
          </p>
        </div>
      )}
      {/* Health bars */}
      <div
        className="flex items-center p-5 rounded-2xl gap-6"
        style={{ background: '#0d1b2a', border: '1px solid rgba(0, 229, 255, 0.2)' }}
      >
        {/* Player */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-mono uppercase tracking-widest truncate" style={{ color: 'rgba(0, 255, 65, 0.7)' }}>
              {myPlayer?.name || 'You'}
            </span>
            <span className="text-2xl font-black font-mono flex-shrink-0" style={{ color: '#00FF41' }}>
              {(myPlayer?.score ?? 0).toLocaleString()}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0, 255, 65, 0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${myPlayer?.health ?? 100}%`, background: '#00FF41', boxShadow: '0 0 8px rgba(0, 255, 65, 0.5)' }}
            />
          </div>
        </div>

        {/* VS */}
        <div
          className="w-11 h-11 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ border: '1px solid rgba(0, 229, 255, 0.35)', background: 'rgba(0, 229, 255, 0.04)' }}
        >
          <span className="text-xs font-black font-mono tracking-widest" style={{ color: 'rgba(0, 229, 255, 0.6)' }}>VS</span>
        </div>

        {/* Opponent */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black font-mono flex-shrink-0" style={{ color: '#BD00FF' }}>
              {(opponent?.score ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-mono uppercase tracking-widest truncate text-right" style={{ color: 'rgba(189, 0, 255, 0.7)' }}>
              {opponent?.name || 'Waiting...'}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex justify-end" style={{ background: 'rgba(189, 0, 255, 0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${opponent?.health ?? 100}%`, background: '#BD00FF', boxShadow: '0 0 8px rgba(189, 0, 255, 0.5)' }}
            />
          </div>
        </div>
      </div>

      {/* Question card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#0d1b2a', border: '1px solid rgba(0, 229, 255, 0.2)' }}
      >
        {/* Question header */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.1)', background: 'rgba(0, 229, 255, 0.03)' }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-0.5 h-4 rounded-full" style={{ background: '#00E5FF' }} />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#00E5FF' }}>
              Question
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <h2 className="text-xl font-bold text-white leading-snug">{question.text}</h2>

          {/* Answer options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);

              let borderColor = 'rgba(0, 229, 255, 0.15)';
              let bgColor = '#020617';
              let textColor = 'rgba(255,255,255,0.65)';
              let letterBg = 'rgba(0, 229, 255, 0.07)';
              let letterColor = 'rgba(0, 229, 255, 0.45)';
              let animClass = '';

              if (selectedOption !== null) {
                if (index === question.correctAnswer) {
                  borderColor = '#00FF41';
                  bgColor = 'rgba(0, 255, 65, 0.06)';
                  textColor = 'white';
                  letterBg = 'rgba(0, 255, 65, 0.15)';
                  letterColor = '#00FF41';
                  animClass = 'animate-pop';
                } else if (index === selectedOption) {
                  borderColor = '#ff4d6d';
                  bgColor = 'rgba(255, 77, 109, 0.06)';
                  textColor = 'white';
                  letterBg = 'rgba(255, 77, 109, 0.15)';
                  letterColor = '#ff4d6d';
                  animClass = 'animate-shake';
                } else {
                  borderColor = 'rgba(0, 229, 255, 0.05)';
                  textColor = 'rgba(255,255,255,0.2)';
                  letterBg = 'transparent';
                  letterColor = 'rgba(255,255,255,0.15)';
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={selectedOption !== null}
                  className={`flex items-center space-x-3 p-4 rounded-xl text-left transition-all ${animClass} ${
                    selectedOption === null ? 'hover:brightness-125 active:scale-95' : ''
                  }`}
                  style={{ border: `1px solid ${borderColor}`, background: bgColor }}
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded text-xs font-mono font-black flex-shrink-0"
                    style={{ background: letterBg, color: letterColor, border: `1px solid ${letterColor}20` }}
                  >
                    {letter}
                  </span>
                  <span className="font-mono text-sm" style={{ color: textColor }}>{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
