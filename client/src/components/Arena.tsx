import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const Arena: React.FC = () => {
  const { gameState, playerId, submitAnswer } = useGame();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (!gameState || !gameState.currentQuestion) return null;

  const question = gameState.currentQuestion;
  const myPlayer = gameState.players[playerId || ''];
  const opponent = Object.values(gameState.players).find(p => p.id !== playerId);

  React.useEffect(() => {
    setSelectedOption(null);
  }, [question.id]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return; // Prevent multiple clicks
    setSelectedOption(index);
    if (gameState && gameState.id) {
      submitAnswer(gameState.id, index);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl space-y-6">
      {/* Health Bars */}
      <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
        <div className="flex flex-col items-start">
          <span className="text-blue-400 font-bold text-lg">You ({myPlayer?.score} pts)</span>
          <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${myPlayer?.health}%` }}
            ></div>
          </div>
        </div>

        <div className="text-2xl font-bold text-gray-500">VS</div>

        <div className="flex flex-col items-end">
          <span className="text-red-400 font-bold text-lg">{opponent ? 'Opponent' : 'Waiting...'} ({opponent?.score || 0} pts)</span>
          <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-red-500 transition-all duration-500" 
              style={{ width: `${opponent?.health || 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">{question.text}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            let buttonStyle = 'border-gray-600 bg-gray-700 text-gray-300 hover:border-blue-400';
            
            if (selectedOption !== null) {
              if (index === question.correctAnswer) {
                buttonStyle = 'border-green-500 bg-green-500/20 text-white animate-pop';
              } else if (index === selectedOption) {
                buttonStyle = 'border-red-500 bg-red-500/20 text-white animate-shake';
              } else {
                buttonStyle = 'border-gray-700 bg-gray-800 text-gray-500 opacity-50';
              }
            } else if (selectedOption === index) {
               // This case is covered above, but for hover state before selection:
               // We can keep the default hover style defined in init
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                disabled={selectedOption !== null}
                className={`p-4 text-left rounded-lg border-2 transition-all transform ${selectedOption === null ? 'hover:scale-102' : ''} ${buttonStyle}`}
              >
                <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
