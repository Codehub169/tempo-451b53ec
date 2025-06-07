import React, { useState, useEffect, useCallback, useRef } from 'react';

const GAME_DURATION = 10; // seconds
const TARGET_SIZE_INITIAL = 70; // pixels
const TARGET_SIZE_MIN = 30; // pixels
const TARGET_SHRINK_RATE = 2; // pixels per click

const SpeedClickerGame = ({ onScoreUpdate, onGameOver, isRunning, isPaused, onReady }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isGameActive, setIsGameActive] = useState(false);
  const [internalIsGameOver, setInternalIsGameOver] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: '50%', left: '50%' });
  const [currentTargetSize, setCurrentTargetSize] = useState(TARGET_SIZE_INITIAL);
  const gameAreaRef = useRef(null);
  const [gameAreaDims, setGameAreaDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if(onReady) onReady();
  }, [onReady]);

  const updateGameAreaDims = useCallback(() => {
    if (gameAreaRef.current) {
      setGameAreaDims({
        width: gameAreaRef.current.offsetWidth,
        height: gameAreaRef.current.offsetHeight,
      });
    }
  }, []); // gameAreaRef is stable, so empty deps are okay

  useEffect(() => {
    updateGameAreaDims(); // Initial call
    window.addEventListener('resize', updateGameAreaDims);
    return () => window.removeEventListener('resize', updateGameAreaDims);
  }, [updateGameAreaDims]);

  const moveTarget = useCallback(() => {
    if (gameAreaRef.current && gameAreaDims.width > 0 && gameAreaDims.height > 0 && gameAreaDims.width > currentTargetSize && gameAreaDims.height > currentTargetSize) {
      const newTop = Math.random() * (gameAreaDims.height - currentTargetSize);
      const newLeft = Math.random() * (gameAreaDims.width - currentTargetSize);
      setTargetPosition({ top: `${newTop}px`, left: `${newLeft}px` });
    } else if (gameAreaRef.current) { // Fallback if dimensions are not ideal, center it
      setTargetPosition({ top: `${gameAreaRef.current.offsetHeight / 2 - currentTargetSize / 2}px`, left: `${gameAreaRef.current.offsetWidth / 2 - currentTargetSize / 2}px` });
    }
  }, [gameAreaDims, currentTargetSize]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCurrentTargetSize(TARGET_SIZE_INITIAL);
    setIsGameActive(true);
    setInternalIsGameOver(false);
    if (onScoreUpdate) onScoreUpdate(0);

    // Ensure dimensions are known before first moveTarget
    if (gameAreaRef.current) {
      const currentWidth = gameAreaRef.current.offsetWidth;
      const currentHeight = gameAreaRef.current.offsetHeight;
      if (currentWidth === 0 || currentHeight === 0 || gameAreaDims.width === 0 || gameAreaDims.height === 0) {
          setGameAreaDims({ width: currentWidth, height: currentHeight });
          // Use a timeout to ensure state update for gameAreaDims is processed before moveTarget relies on it
          setTimeout(() => {
            // Re-check target size against potentially updated dims
            const initialSize = TARGET_SIZE_INITIAL;
            const newTop = Math.random() * (currentHeight - initialSize);
            const newLeft = Math.random() * (currentWidth - initialSize);
            setTargetPosition({ top: `${newTop}px`, left: `${newLeft}px` });
          }, 0);
      } else {
          moveTarget();
      }
    }
  }, [onScoreUpdate, moveTarget, gameAreaDims.width, gameAreaDims.height]); // Added gameAreaDims width/height

  useEffect(() => {
    if (isRunning && (!isGameActive || internalIsGameOver)) {
      startGame();
    }
  }, [isRunning, isGameActive, internalIsGameOver, startGame]);

  useEffect(() => {
    let timer;
    if (isGameActive && !internalIsGameOver && !isPaused) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(prevTime => prevTime - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        setIsGameActive(false);
        setInternalIsGameOver(true);
        if (onGameOver) onGameOver(score);
      }
    }
    return () => clearTimeout(timer);
  }, [isGameActive, internalIsGameOver, isPaused, timeLeft, score, onGameOver]);

  const handleTargetClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    if (!isGameActive || internalIsGameOver || isPaused) return;
    
    const newScore = score + 1;
    setScore(newScore);
    if (onScoreUpdate) onScoreUpdate(newScore);
    
    setCurrentTargetSize(prevSize => Math.max(TARGET_SIZE_MIN, prevSize - TARGET_SHRINK_RATE));
    moveTarget();
  };

  if (!isGameActive && !internalIsGameOver && !isRunning) {
    return (
      <div className="flex items-center justify-center w-full h-full text-text-medium">
        Press Start (on GamePage) to Play
      </div>
    );
  }
  if (!isGameActive && !internalIsGameOver && isRunning) {
     return (
      <div className="flex flex-col items-center justify-center h-full bg-primary-bg p-4 rounded-lg">
        <h2 className="text-3xl font-bold text-accent mb-6 font-secondary">Speed Clicker</h2>
         <p className="text-text-medium text-center">Click the target as fast as you can!</p>
         <p className="text-text-light text-sm mt-2">Game is ready. It will start automatically.</p>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-center h-full bg-primary-bg p-4 rounded-lg relative select-none overflow-hidden touch-manipulation"
      ref={gameAreaRef}
    >
      <div className="w-full flex justify-between items-center mb-4 absolute top-4 left-0 right-0 px-4 z-10">
        <p className="text-xl sm:text-2xl text-text-light">Score: <span className='font-bold text-accent'>{score}</span></p>
        <p className="text-xl sm:text-2xl text-text-light">Time: <span className='font-bold text-accent'>{timeLeft}s</span></p>
      </div>

      {isGameActive && !internalIsGameOver && !isPaused && (
        <button
          onClick={handleTargetClick}
          onTouchStart={handleTargetClick} // Use onTouchStart for faster response on touch devices
          className="absolute bg-pink-500 rounded-full transition-all duration-100 ease-out focus:outline-none transform hover:scale-110 active:scale-95 shadow-xl border-2 border-pink-300"
          style={{
            width: `${currentTargetSize}px`,
            height: `${currentTargetSize}px`,
            top: targetPosition.top,
            left: targetPosition.left,
            // transform: `translate(-50%, -50%)` // Centering might be off if top/left are direct coordinates
          }}
          aria-label="Click target"
        />
      )}

      {internalIsGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg z-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Game Over!</h3>
          <p className="text-lg sm:text-xl text-white mb-6">Final Score: {score}</p>
        </div>
      )}
      {isPaused && isGameActive && !internalIsGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-lg p-4 z-30">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Paused</h3>
        </div>
      )}
    </div>
  );
};

export default SpeedClickerGame;
