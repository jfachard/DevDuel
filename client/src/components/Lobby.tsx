import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const Lobby: React.FC = () => {
  const { createGame, joinGame, gameState, playerId } = useGame();
  const [joinId, setJoinId] = useState('');
  const [username, setUsername] = useState('');

  const handleCreate = () => {
    if (!username) return alert('Please enter a username');
    createGame();
    // TODO: Send username to server
  };

  const handleJoin = () => {
    if (!username) return alert('Please enter a username');
    if (!joinId) return alert('Please enter a Game ID');
    joinGame(joinId);
    // TODO: Send username to server
  };

  if (gameState) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
        <h2 className="text-3xl font-bold text-blue-400">Lobby</h2>
        <div className="text-center">
          <p className="text-gray-400">Game ID:</p>
          <p className="text-4xl font-mono font-bold text-white tracking-wider my-2">{gameState.id}</p>
        </div>
        
        <div className="flex flex-col space-y-2 w-full">
          <h3 className="text-xl font-semibold text-gray-300">Players:</h3>
          {Object.values(gameState.players).map((p) => (
            <div key={p.id} className={`p-3 rounded-lg flex justify-between items-center ${p.id === playerId ? 'bg-blue-600/20 border border-blue-500' : 'bg-gray-700'}`}>
              <span className="font-medium">{p.id === playerId ? `${username} (You)` : 'Opponent'}</span>
              <span className={`text-xs px-2 py-1 rounded ${p.isHost ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-600 text-gray-300'}`}>
                {p.isHost ? 'HOST' : 'GUEST'}
              </span>
            </div>
          ))}
        </div>

        {gameState.status === 'waiting' && (
          <div className="flex items-center space-x-2 text-yellow-400 animate-pulse">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Waiting for opponent...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Enter the Arena
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="WarriorName123"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-500">OR</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCreate}
            className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all transform hover:scale-105 shadow-lg group"
          >
            <span className="text-2xl mb-1">⚔️</span>
            <span className="font-bold">Create Game</span>
          </button>

          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value.toUpperCase())}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-center text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono uppercase"
              placeholder="GAME ID"
            />
            <button
              onClick={handleJoin}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors shadow-lg"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
