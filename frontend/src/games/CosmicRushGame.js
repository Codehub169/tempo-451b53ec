import React, { useState, useEffect, useCallback, useRef } from 'react';

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 30;
const GAME_WIDTH = 600; // Assuming a fixed game width for simplicity
const GAME_HEIGHT = 400; // Assuming a fixed game height
const OBSTACLE_SPEED = 5;
const PLAYER_MOVE_AMOUNT = 20;
const OBSTACLE_SPAWN_RATE = 0.05; // Lower is less frequent

const CosmicRushGame = ({ onScoreUpdate, onGameOver, isRunning, isPaused, onReady }) => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [internalIsGameOver, setInternalIsGameOver] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const gameAreaRef = useRef(null);
  const animationFrameId = useRef(null);

  const resetGame = useCallback(() => {
    setPlayerX(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
    setObstacles([]);
    setScore(0);
    setInternalIsGameOver(false);
    setIsGameActive(true);
    if (onScoreUpdate) onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    if (onReady) onReady();
  }, [onReady]);

  useEffect(() => {
    if (isRunning && (!isGameActive || internalIsGameOver)) {
      resetGame();
    }
  }, [isRunning, resetGame, isGameActive, internalIsGameOver]);

  // Focus game area when it becomes interactive and is not paused
  useEffect(() => {
    if (isGameActive && !internalIsGameOver && !isPaused && gameAreaRef.current) {
      gameAreaRef.current.focus({ preventScroll: true });
    }
  }, [isGameActive, internalIsGameOver, isPaused]);

  const gameTick = useCallback(() => {
    if (internalIsGameOver || !isGameActive) {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    if (isPaused) {
      animationFrameId.current = requestAnimationFrame(gameTick);
      return;
    }

    let newObstacles = obstacles
      .map(obs => ({ ...obs, y: obs.y + OBSTACLE_SPEED }))
      .filter(obs => obs.y < GAME_HEIGHT);

    if (Math.random() < OBSTACLE_SPAWN_RATE) {
      const newObstacleX = Math.random() * (GAME_WIDTH - OBSTACLE_WIDTH);
      newObstacles.push({ 
        x: newObstacleX, 
        y: 0, 
        id: Date.now() + Math.random()
      });
    }

    let collisionDetected = false;
    for (const obs of newObstacles) {
      if (
        playerX < obs.x + OBSTACLE_WIDTH &&
        playerX + PLAYER_WIDTH > obs.x &&
        GAME_HEIGHT - PLAYER_HEIGHT < obs.y + OBSTACLE_HEIGHT &&
        GAME_HEIGHT > obs.y
      ) {
        collisionDetected = true;
        break;
      }
    }

    if (collisionDetected) {
      setInternalIsGameOver(true);
      setIsGameActive(false);
      if (onGameOver) onGameOver(score); 
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    setObstacles(newObstacles);

    setScore(prevScore => {
      const updatedScore = prevScore + 1;
      if (onScoreUpdate) onScoreUpdate(updatedScore);
      return updatedScore;
    });

    animationFrameId.current = requestAnimationFrame(gameTick);
  }, [
    internalIsGameOver, 
    isGameActive, 
    isPaused, 
    obstacles, 
    playerX, 
    score, 
    onGameOver, 
    onScoreUpdate
  ]);

  useEffect(() => {
    if (isGameActive && !internalIsGameOver && !isPaused) {
      animationFrameId.current = requestAnimationFrame(gameTick);
    } else {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameTick, isGameActive, internalIsGameOver, isPaused]);

  const movePlayer = useCallback((direction) => {
    if (internalIsGameOver || !isGameActive || isPaused) return;
    if (direction === 'left') {
      setPlayerX(prevX => Math.max(0, prevX - PLAYER_MOVE_AMOUNT));
    } else if (direction === 'right') {
      setPlayerX(prevX => Math.min(GAME_WIDTH - PLAYER_WIDTH, prevX + PLAYER_MOVE_AMOUNT));
    }
  }, [internalIsGameOver, isGameActive, isPaused]);

  useEffect(() => {
    const gameElement = gameAreaRef.current; // Capture current ref value for cleanup

    const handleKeyDown = (e) => {
      if (internalIsGameOver || !isGameActive || isPaused) return;
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        e.stopPropagation();
        movePlayer('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        e.stopPropagation();
        movePlayer('right');
      }
    };

    if (gameElement) {
      gameElement.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (gameElement) {
        gameElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [internalIsGameOver, isGameActive, isPaused, movePlayer]);
  
  if (!isGameActive && !isRunning && !internalIsGameOver) {
    return (
      <div className="flex items-center justify-center w-full h-full text-text-medium">
        Press Start to Play
      </div>
    );
  }

  return (
    <div
      ref={gameAreaRef}
      className="relative bg-primary-bg w-full h-full overflow-hidden border-2 border-accent select-none touch-manipulation cursor-default"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0} // Makes the div focusable
    >
      <div
        className="absolute bg-blue-500"
        style={{
          width: `${PLAYER_WIDTH}px`,
          height: `${PLAYER_HEIGHT}px`,
          left: `${playerX}px`,
          bottom: `0px`,
          transition: 'left 0.05s linear'
        }}
        role="img" 
        aria-label="Player Ship"
      />

      {obstacles.map(obs => (
        <div
          key={obs.id}
          className="absolute bg-red-500"
          style={{
            width: `${OBSTACLE_WIDTH}px`,
            height: `${OBSTACLE_HEIGHT}px`,
            left: `${obs.x}px`,
            top: `${obs.y}px`,
          }}
          role="img"
          aria-label="Obstacle"
        />
      ))}

      {internalIsGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white z-10 p-4">
          <h2 className="text-3xl font-bold font-secondary mb-4">Game Over!</h2>
          <p className="text-xl">Final Score: {score}</p>
        </div>
      )}

      {isGameActive && !internalIsGameOver && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-around px-4 z-20 md:hidden">
          <button 
            onTouchStart={(e) => { e.preventDefault(); movePlayer('left'); }}
            onMouseDown={(e) => { e.preventDefault(); movePlayer('left'); }} 
            className="px-8 py-4 bg-accent/70 text-white rounded-lg text-xl font-bold active:bg-accent select-none"
            aria-label="Move Left"
          >
            Left
          </button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); movePlayer('right'); }}
            onMouseDown={(e) => { e.preventDefault(); movePlayer('right'); }} 
            className="px-8 py-4 bg-accent/70 text-white rounded-lg text-xl font-bold active:bg-accent select-none"
            aria-label="Move Right"
          >
            Right
          </button>
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

export default CosmicRushGame;
