import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const CodeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const LinuxIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const SQLIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const DockerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const DevOpsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const CATEGORIES = [
  { id: 'Code',     name: 'General Code', Icon: CodeIcon },
  { id: 'Linux',    name: 'Linux',        Icon: LinuxIcon },
  { id: 'SQL',      name: 'SQL',          Icon: SQLIcon },
  { id: 'Docker',   name: 'Docker',       Icon: DockerIcon },
  { id: 'DevOps',   name: 'DevOps',       Icon: DevOpsIcon },
  { id: 'Security', name: 'Security',     Icon: SecurityIcon },
];

const PANEL_STYLE: React.CSSProperties = {
  background: '#0d1b2a',
  border: '1px solid rgba(0, 229, 255, 0.25)',
  boxShadow: '0 0 60px rgba(0, 229, 255, 0.05), 0 0 120px rgba(189, 0, 255, 0.03)',
};

const INPUT_STYLE: React.CSSProperties = {
  background: '#020617',
  border: '1px solid rgba(0, 229, 255, 0.2)',
};

const LABEL_STYLE: React.CSSProperties = {
  color: 'rgba(0, 229, 255, 0.6)',
};

export const Lobby: React.FC = () => {
  const { createGame, joinGame, leaveGame, gameState, playerId, connected, error } = useGame();
  const [username, setUsername] = useState('');
  const [gameIdInput, setGameIdInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Code');

  const handleCreateGame = () => {
    if (!username.trim()) return alert('Please enter a username');
    if (!connected) return alert('Not connected to server. Please wait.');
    createGame(selectedCategory, username.trim());
  };

  const handleJoinGame = () => {
    if (!username.trim()) return alert('Please enter a username');
    if (!gameIdInput.trim()) return alert('Please enter a Game ID');
    if (!connected) return alert('Not connected to server. Please wait.');
    joinGame(gameIdInput.trim(), username.trim());
  };

  if (gameState) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-lg animate-fade-in">
        <div className="w-full rounded-2xl p-8 space-y-6" style={PANEL_STYLE}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest font-mono mb-1" style={LABEL_STYLE}>
                Arena Lobby
              </p>
              <h2
                className="text-3xl font-black uppercase tracking-widest"
                style={{ color: '#00E5FF', textShadow: '0 0 20px rgba(0, 229, 255, 0.5)' }}
              >
                Waiting Room
              </h2>
            </div>
            <button
              onClick={leaveGame}
              className="text-xs font-mono uppercase tracking-widest px-3 py-1.5 rounded transition-all hover:brightness-125 mt-1"
              style={{ color: '#ff4d6d', border: '1px solid rgba(255,77,109,0.35)' }}
            >
              Leave
            </button>
          </div>

          <div className="p-4 rounded-xl" style={INPUT_STYLE}>
            <p className="text-xs uppercase tracking-widest font-mono mb-2" style={{ color: 'rgba(0, 229, 255, 0.5)' }}>
              Game ID — Share with your opponent
            </p>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-mono font-black tracking-widest text-white">{gameState.id}</span>
              <button
                onClick={() => navigator.clipboard.writeText(gameState.id)}
                className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded transition-all hover:brightness-125"
                style={{ color: '#00E5FF', border: '1px solid rgba(0, 229, 255, 0.3)' }}
              >
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest font-mono" style={LABEL_STYLE}>
              Players
            </p>
            {Object.values(gameState.players).map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={INPUT_STYLE}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: player.id === playerId ? '#00FF41' : '#00E5FF' }}
                  />
                  <span className="font-mono font-bold text-white text-sm">
                    {player.name}{player.id === playerId ? ' (You)' : ''}
                  </span>
                </div>
                {player.isHost && (
                  <span
                    className="text-xs font-mono uppercase tracking-widest px-2 py-0.5 rounded"
                    style={{ color: '#00FF41', border: '1px solid rgba(0, 255, 65, 0.3)', background: 'rgba(0, 255, 65, 0.05)' }}
                  >
                    Host
                  </span>
                )}
              </div>
            ))}

            {Object.keys(gameState.players).length < 2 && (
              <div
                className="flex items-center justify-center p-4 rounded-lg border border-dashed animate-pulse"
                style={{ borderColor: 'rgba(0, 229, 255, 0.2)', color: 'rgba(255,255,255,0.25)' }}
              >
                <span className="font-mono text-sm uppercase tracking-widest">Waiting for opponent...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg animate-fade-in">
      <div className="w-full rounded-2xl p-8 space-y-6" style={PANEL_STYLE}>
        {/* Title */}
        <div className="text-center space-y-1">
          <h1
            className="text-6xl font-black uppercase tracking-widest"
            style={{ color: '#00E5FF', textShadow: '0 0 30px rgba(0, 229, 255, 0.6), 0 0 60px rgba(0, 229, 255, 0.2)' }}
          >
            DEVDUEL
          </h1>
          <p className="text-xs uppercase tracking-widest font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Real-Time Coding Battles
          </p>
          <div className="flex items-center justify-center space-x-2 pt-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: connected ? '#00FF41' : '#ff4d6d', boxShadow: connected ? '0 0 6px #00FF41' : '0 0 6px #ff4d6d' }}
            />
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {connected ? 'Server connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            className="flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-widest"
            style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.35)', color: '#ff4d6d' }}
          >
            <span>✕</span>
            <span>{error}</span>
          </div>
        )}

        {/* Username */}
        <div className="space-y-2">
          <label className="block text-xs uppercase tracking-widest font-mono" style={LABEL_STYLE}>
            Warrior Username
          </label>
          <div className="flex items-center rounded-lg px-4 py-3" style={INPUT_STYLE}>
            <span className="font-mono mr-3 text-sm select-none" style={{ color: '#00E5FF' }}>&gt;</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-transparent text-white font-mono focus:outline-none text-sm"
              placeholder="your_handle"
              style={{ caretColor: '#00E5FF', color: 'white' }}
            />
          </div>
        </div>

        {/* Category selection */}
        <div className="space-y-3">
          <label className="block text-xs uppercase tracking-widest font-mono" style={LABEL_STYLE}>
            Select Arena Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(({ id, name, Icon }) => {
              const isSelected = selectedCategory === id;
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className="flex flex-col items-center justify-center py-4 px-2 rounded-lg transition-all space-y-2"
                  style={{
                    background: isSelected ? 'rgba(0, 229, 255, 0.08)' : '#020617',
                    border: `1px solid ${isSelected ? '#00E5FF' : 'rgba(0, 229, 255, 0.15)'}`,
                    color: isSelected ? '#00E5FF' : 'rgba(255,255,255,0.35)',
                    boxShadow: isSelected ? '0 0 16px rgba(0, 229, 255, 0.12)' : 'none',
                  }}
                >
                  <Icon />
                  <span className="text-xs font-mono uppercase tracking-wide">{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={handleCreateGame}
          className="w-full py-4 rounded-lg font-black text-sm uppercase tracking-widest font-mono transition-all hover:brightness-110 active:scale-95"
          style={{
            background: '#00E5FF',
            color: '#020617',
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.25)',
          }}
        >
          Create New Arena
        </button>

        {/* Separator */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(0, 229, 255, 0.1)' }} />
          <span className="text-xs font-mono uppercase tracking-widest whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Or Join Existing
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(0, 229, 255, 0.1)' }} />
        </div>

        {/* Join */}
        <div className="flex space-x-2">
          <div className="flex-1 flex items-center rounded-lg px-4 py-3" style={INPUT_STYLE}>
            <input
              type="text"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value.toUpperCase())}
              className="w-full bg-transparent font-mono text-center uppercase focus:outline-none text-sm tracking-widest"
              placeholder="GAME  ID"
              maxLength={6}
              style={{ caretColor: '#00E5FF', color: 'white' }}
            />
          </div>
          <button
            onClick={handleJoinGame}
            className="px-6 rounded-lg font-mono font-black text-sm uppercase tracking-widest transition-all hover:brightness-125 active:scale-95"
            style={{
              background: 'transparent',
              border: '1px solid #00E5FF',
              color: '#00E5FF',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.08)',
            }}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};
