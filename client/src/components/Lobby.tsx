import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const CATEGORIES = [
  { id: 'Code', name: 'General Code', icon: '💻' },
  { id: 'Linux', name: 'Linux', icon: '🐧' },
  { id: 'SQL', name: 'SQL', icon: '💾' },
  { id: 'Docker', name: 'Docker', icon: '🐳' },
  { id: 'DevOps', name: 'DevOps', icon: '⚙️' },
];

export const Lobby: React.FC = () => {
  const { createGame, joinGame, gameState, playerId } = useGame();
  const [username, setUsername] = useState('');
  const [gameIdInput, setGameIdInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Code');

  const handleCreateGame = () => {
    if (!username) return alert('Please enter a username');
    createGame(selectedCategory);
  };

  const handleJoinGame = () => {
    if (!username) return alert('Please enter a username');
    if (!gameIdInput) return alert('Please enter a Game ID');
    joinGame(gameIdInput);
  };

  if (gameState) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 bg-gray-800 p-12 rounded-2xl shadow-2xl border border-gray-700 animate-fade-in max-w-md w-full">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Lobby
        </h2>
        
        <div className="w-full bg-gray-900 p-6 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Game ID</p>
          <div className="flex justify-between items-center">
             <span className="text-3xl font-mono font-bold text-white tracking-widest">{gameState.id}</span>
             <button 
               onClick={() => navigator.clipboard.writeText(gameState.id)}
               className="text-blue-400 hover:text-blue-300 text-sm"
             >
               Copy
             </button>
          </div>
        </div>

        <div className="w-full space-y-4">
          <h3 className="text-xl font-bold text-white border-b border-gray-700 pb-2">Players</h3>
          {Object.values(gameState.players).map((player) => (
            <div key={player.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${player.id === playerId ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <span className="font-bold text-white">{player.id === playerId ? `${username} (You)` : 'Opponent'}</span>
              </div>
              {player.isHost && <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">HOST</span>}
            </div>
          ))}
          
          {Object.keys(gameState.players).length < 2 && (
            <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-700 rounded-lg text-gray-500 animate-pulse">
              Waiting for opponent...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 bg-gray-800 p-12 rounded-2xl shadow-2xl border border-gray-700 animate-fade-in max-w-md w-full">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          DevDuel
        </h1>
        <p className="text-gray-400">Real-time Coding Battles</p>
      </div>

      <div className="w-full space-y-6">
        <div>
          <label className="block text-gray-400 text-sm font-bold mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            placeholder="Enter your warrior name"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-500">CREATE GAME</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center justify-center space-y-1 ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105'
                    : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-bold">{cat.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCreateGame}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all hover:scale-102 flex items-center justify-center space-x-2"
          >
            <span>⚔️</span>
            <span>Create New Arena</span>
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-500">OR JOIN EXISTING</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={gameIdInput}
            onChange={(e) => setGameIdInput(e.target.value.toUpperCase())}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono tracking-widest text-center uppercase"
            placeholder="GAME ID"
            maxLength={6}
          />
          <button
            onClick={handleJoinGame}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
