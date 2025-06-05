import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { gameService } from '../services/gameService';
import { scoreService } from '../services/scoreService';
import { useAuth } from '../contexts/AuthContext';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [gameDetails, setGameDetails] = useState(null);
  const [GameComponent, setGameComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0); // User's session high score, or fetched personal best if implemented
  const [gameStatus, setGameStatus] = useState('Loading'); // Loading, Ready, Playing, Paused, GameOver
  const [isGameRunning, setIsGameRunning] = useState(false);

  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      setError(null);
      setGameDetails(null); 
      setGameComponent(null); 
      setCurrentScore(0); 
      setHighScore(0); 
      setGameStatus('Loading');
      setIsGameRunning(false);

      try {
        const details = await gameService.getGameDetails(gameId.toLowerCase());
        if (details) {
          setGameDetails(details);
          setGameComponent(() => details.component); 
          // Game component will call onReady to set gameStatus to 'Ready'
          // TODO: Fetch actual high score for this game and user if available
          // if (isAuthenticated && user && details.name) { 
          //   try {
          //     const userSpecificHighScore = await scoreService.getUserGameHighScore(user.id, details.name);
          //     setHighScore(userSpecificHighScore);
          //   } catch (hsError) { console.warn('Could not fetch user high score for this game.', hsError); }
          // }
        } else {
          setError('Game not found. It might be an invalid URL or the game is not available.');
          setGameStatus('Error');
        }
      } catch (err) {
        console.error("Error fetching game details:", err);
        setError('Failed to load game details. Please try again later.');
        setGameStatus('Error');
      } finally {
        setIsLoading(false);
      }
    };
    if (gameId) {
      fetchGameData();
    }
  }, [gameId, isAuthenticated, user]);

  const handleStartGame = useCallback(() => {
    // This will trigger the isRunning prop for the GameComponent
    // The GameComponent's useEffect for isRunning should then call its internal startGame method.
    setIsGameRunning(true);
    setGameStatus('Playing');
    setCurrentScore(0); // Reset score on this page, game component might also reset its internal score
  }, []);

  const handlePauseResumeGame = useCallback(() => {
    if (gameStatus === 'Playing') {
      setGameStatus('Paused');
    } else if (gameStatus === 'Paused') {
      setGameStatus('Playing');
    }
  }, [gameStatus]);

  const handleExitGame = () => {
    navigate('/');
  };

  const onScoreUpdate = useCallback((newScore) => {
    setCurrentScore(newScore);
  }, []);

  const onGameOver = useCallback(async (finalScore) => {
    setGameStatus('GameOver');
    setIsGameRunning(false); // Signal that the game is no longer actively running from GamePage's perspective
    setCurrentScore(finalScore);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    if (isAuthenticated && gameDetails && gameDetails.name) {
      try {
        await scoreService.submitScore(gameDetails.name, finalScore);
        console.log('Score submitted successfully!', { game: gameDetails.name, score: finalScore });
      } catch (submissionError) {
        console.error('Failed to submit score:', submissionError);
        // Optionally, show an error message to the user (e.g., using a toast notification)
      }
    }
  }, [highScore, isAuthenticated, gameDetails, scoreService]); // Added scoreService to dependencies

  if (isLoading) {
    return <Layout><div className="text-center py-10 text-xl text-text-medium">Loading game details...</div></Layout>;
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10 bg-error/10 text-error p-4 rounded-md">
          <p>{error}</p>
          <Button onClick={() => navigate('/')} variant="primary" className="mt-4">Go to Games</Button>
        </div>
      </Layout>
    );
  }

  if (!gameDetails || !GameComponent) {
    return <Layout><div className="text-center py-10 text-xl text-text-medium">Game data is unavailable or failed to load.</div></Layout>;
  }

  return (
    <Layout>
      <div className="flex flex-col items-center py-8 px-4">
        <h1 className="font-secondary text-3xl sm:text-4xl text-accent mb-6 text-center">
          {gameDetails.name}
        </h1>

        <div 
          className="w-full max-w-3xl aspect-[16/10] bg-primary-bg border-2 border-border-color rounded-lg shadow-lg mb-8 flex items-center justify-center text-text-medium font-secondary text-2xl overflow-hidden relative"
          id="gameCanvasContainer"
        >
          <Suspense fallback={<div className='text-center p-5 text-text-medium'>Loading Game Screen...</div>}>
            <GameComponent 
              onScoreUpdate={onScoreUpdate} 
              onGameOver={onGameOver} 
              isPaused={gameStatus === 'Paused'}
              isRunning={isGameRunning} // This prop tells the game component to start/restart
              onReady={() => setGameStatus('Ready')}
              key={gameId} // Ensures GameComponent remounts if gameId changes
            />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-8">
          <div className="bg-secondary-bg p-6 rounded-lg shadow-md">
            <h3 className="font-secondary text-xl text-accent mb-3">Game Info</h3>
            <p className="text-text-medium">Current Score: <span className="font-bold text-text-light text-lg">{currentScore.toLocaleString()}</span></p>
            <p className="text-text-medium">High Score: <span className="font-bold text-text-light text-lg">{highScore.toLocaleString()}</span></p>
            <p className="text-text-medium">Status: <span className="font-semibold text-text-light">{gameStatus}</span></p>
          </div>
          <div className="bg-secondary-bg p-6 rounded-lg shadow-md">
            <h3 className="font-secondary text-xl text-accent mb-3">Controls</h3>
            {gameDetails.controls && gameDetails.controls.length > 0 ? (
              <ul className="list-none space-y-1 text-text-medium">
                {gameDetails.controls.map((control, index) => (
                  <li key={index}>
                    <strong className="text-text-light">{control.key}:</strong> {control.action}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-text-medium'>Controls not specified.</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button 
            onClick={handleStartGame} 
            variant="primary" 
            size="lg"
            disabled={gameStatus === 'Playing' || gameStatus === 'Loading' || gameStatus === 'Error'} // Disable start if already playing or loading
          >
            {gameStatus === 'Playing' || gameStatus === 'Paused' ? 'Restart Game' : 'Start Game'}
          </Button>
          <Button 
            onClick={handlePauseResumeGame} 
            variant="secondary" 
            size="lg" 
            disabled={gameStatus !== 'Playing' && gameStatus !== 'Paused'}
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
