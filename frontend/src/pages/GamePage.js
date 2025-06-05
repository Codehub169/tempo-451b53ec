import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
// import { getGameDetails } from '../services/gameService'; // Placeholder for API

// Mock game details - in a real app, this would come from gameService or be part of game components
const gameDetailsMap = {
  cosmicrush: {
    name: 'Cosmic Rush',
    controls: [
      { key: 'Left/Right Arrows', action: 'Steer Ship' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: lazy(() => import('../games/CosmicRushGame')),
  },
  blockstacker: {
    name: 'Block Stacker',
    controls: [
      { key: 'Spacebar', action: 'Drop Block' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: lazy(() => import('../games/BlockStackerGame')),
  },
  pixelpong: {
    name: 'Pixel Pong',
    controls: [
      { key: 'W/S Keys', action: 'Player 1 Up/Down' },
      { key: 'Up/Down Arrows', action: 'Player 2 Up/Down (or AI)' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: lazy(() => import('../games/PixelPongGame')),
  },
  memorymatch: {
    name: 'Memory Match',
    controls: [
      { key: 'Mouse Click', action: 'Flip Card' },
      { key: 'P', action: 'Pause Game' },
    ],
    component: lazy(() => import('../games/MemoryMatchGame')),
  },
  speedclicker: {
    name: 'Speed Clicker',
    controls: [{ key: 'Mouse Click', action: 'Click Target' }],
    component: lazy(() => import('../games/SpeedClickerGame')),
  },
  mazerunnerx: {
    name: 'Maze Runner X',
    controls: [
        { key: 'Arrow Keys', action: 'Move Character' },
        { key: 'P', action: 'Pause Game' },
    ],
    component: lazy(() => import('../games/MazeRunnerXGame')),
  }
};

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game state placeholders - actual game logic will be in game components
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // This would typically be fetched
  const [gameStatus, setGameStatus] = useState('Ready'); // e.g., Ready, Playing, Paused, GameOver
  const [isGameRunning, setIsGameRunning] = useState(false);

  useEffect(() => {
    const details = gameDetailsMap[gameId.toLowerCase()];
    if (details) {
      setGameDetails(details);
      // Fetch actual high score for this game and user if available
      // e.g., getHighScore(gameId).then(setHighScore);
      setIsLoading(false);
    } else {
      setError('Game not found. It might be an invalid URL or the game is not available.');
      setIsLoading(false);
    }
  }, [gameId]);

  const handleStartGame = () => {
    setIsGameRunning(true);
    setGameStatus('Playing');
    setCurrentScore(0); // Reset score
    // Actual game start logic will be in the specific game component via refs or context
    console.log(`Starting game: ${gameId}`);
  };

  const handlePauseResumeGame = () => {
    if(isGameRunning) {
        setGameStatus(isGameRunning && gameStatus === 'Paused' ? 'Playing' : 'Paused');
        // Actual game pause/resume logic
        console.log(gameStatus === 'Paused' ? `Resuming game: ${gameId}` : `Pausing game: ${gameId}`);
    }    
  };

  const handleExitGame = () => {
    navigate('/'); // Navigate back to home/game selection
  };

  // Placeholder for score updates from game component
  const onScoreUpdate = (newScore) => {
    setCurrentScore(newScore);
  };

  // Placeholder for game over from game component
  const onGameOver = (finalScore) => {
    setGameStatus('Game Over');
    setIsGameRunning(false);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      // Potentially submit score to backend here
    }
  };

  if (isLoading) {
    return <Layout><div className="text-center py-10 text-xl">Loading game details...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="text-center py-10 text-error bg-error/10 p-4 rounded-md">{error} <Button onClick={() => navigate('/')} className="mt-4">Go to Games</Button></div></Layout>;
  }

  if (!gameDetails) {
    return <Layout><div className="text-center py-10 text-xl">Game details not available.</div></Layout>;
  }

  const GameComponent = gameDetails.component;

  return (
    <Layout>
      <div className="flex flex-col items-center py-8">
        <h1 className="font-secondary text-3xl sm:text-4xl text-accent mb-6">
          {gameDetails.name}
        </h1>

        <div 
          className="w-full max-w-3xl aspect-[16/10] bg-primary-bg border-2 border-border-color rounded-lg shadow-lg mb-8 flex items-center justify-center text-text-medium font-secondary text-2xl overflow-hidden"
          id="gameCanvasContainer"
        >
          <Suspense fallback={<div className='text-center'>Loading Game Screen...</div>}>
            { GameComponent ? 
              <GameComponent 
                onScoreUpdate={onScoreUpdate} 
                onGameOver={onGameOver} 
                isPaused={gameStatus === 'Paused'}
                isRunning={isGameRunning} // Prop to tell game it should be active
                onReady={() => setGameStatus('Ready')} // Game can signal it's loaded
              /> 
              : 'Game Area Placeholder' 
            }
          </Suspense>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
          <div className="bg-secondary-bg p-6 rounded-lg shadow-md">
            <h3 className="font-secondary text-xl text-accent mb-3">Game Info</h3>
            <p>Current Score: <span className="font-bold text-text-light text-lg">{currentScore}</span></p>
            <p>High Score: <span className="font-bold text-text-light text-lg">{highScore}</span></p>
            <p>Status: <span className="font-semibold text-text-light">{gameStatus}</span></p>
          </div>
          <div className="bg-secondary-bg p-6 rounded-lg shadow-md">
            <h3 className="font-secondary text-xl text-accent mb-3">Controls</h3>
            <ul className="list-none space-y-1">
              {gameDetails.controls.map((control, index) => (
                <li key={index}>
                  <strong className="text-text-light">{control.key}:</strong> <span className="text-text-medium">{control.action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={handleStartGame} 
            variant="primary" 
            size="lg"
            disabled={gameStatus === 'Playing' && isGameRunning}
          >
            {isGameRunning || gameStatus === 'Paused' ? 'Restart Game' : 'Start Game'}
          </Button>
          <Button 
            onClick={handlePauseResumeGame} 
            variant="secondary" 
            size="lg" 
            disabled={!isGameRunning || gameStatus === 'Game Over' || gameStatus === 'Ready'}
          >
            {gameStatus === 'Paused' ? 'Resume' : 'Pause'}
          </Button>
          <Button onClick={handleExitGame} variant="outline" size="lg">Exit to Menu</Button>
        </div>
      </div>
    </Layout>
  );
};

export default GamePage;
