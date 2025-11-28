import { GameProvider, useGame } from './context/GameContext';
import { Lobby } from './components/Lobby';
import { Arena } from './components/Arena';
import { GameOver } from './components/GameOver';
import './index.css';

const GameScreen = () => {
  const { gameState } = useGame();
  
  if (gameState?.status === 'playing') {
    return <Arena />;
  }

  if (gameState?.status === 'finished') {
    return <GameOver />;
  }
  
  return <Lobby />;
};

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <GameScreen />
      </div>
    </GameProvider>
  )
}

export default App
