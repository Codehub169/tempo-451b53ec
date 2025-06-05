import React, { useState, useEffect, useCallback, useRef } from 'react';

const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 30;
const GAME_WIDTH = 600; // Assuming a fixed game width for simplicity
const GAME_HEIGHT = 400; // Assuming a fixed game height

const CosmicRushGame = ({ onScoreUpdate, onGameOver }) => {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameAreaRef = useRef(null);
  const animationFrameId = useRef(null);

  const gameTick = useCallback(() => {
    if (isGameOver) return;

    // Move obstacles down
    setObstacles(prevObstacles =>
      prevObstacles
        .map(obs => ({ ...obs, y: obs.y + 5 }))
        .filter(obs => obs.y < GAME_HEIGHT)
    );

    // Add new obstacle periodically
    if (Math.random() < 0.05) { // Adjust frequency as needed
      const newObstacleX = Math.random() * (GAME_WIDTH - OBSTACLE_WIDTH);
      setObstacles(prevObstacles => [
        ...prevObstacles,
        { x: newObstacleX, y: 0, id: Date.now() },
      ]);
    }

    // Check for collisions
    obstacles.forEach(obs => {
      if (
        playerX < obs.x + OBSTACLE_WIDTH &&
        playerX + PLAYER_WIDTH > obs.x &&
        GAME_HEIGHT - PLAYER_HEIGHT < obs.y + OBSTACLE_HEIGHT &&
        GAME_HEIGHT > obs.y // Player is at the bottom
      ) {
        setIsGameOver(true);
        onGameOver(score);
        return;
      }
    });

    if (!isGameOver) {
      setScore(prevScore => prevScore + 1);
      onScoreUpdate(score + 1);
      animationFrameId.current = requestAnimationFrame(gameTick);
    }
  }, [isGameOver, obstacles, playerX, score, onGameOver, onScoreUpdate]);

  useEffect(() => {
    // Initialize game or start tick
    animationFrameId.current = requestAnimationFrame(gameTick);
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameTick]); // Start game on mount

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;
      if (e.key === 'ArrowLeft') {
        setPlayerX(prevX => Math.max(0, prevX - 20));
      } else if (e.key === 'ArrowRight') {
        setPlayerX(prevX => Math.min(GAME_WIDTH - PLAYER_WIDTH, prevX + 20));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameOver]);

  return (
    <div
      ref={gameAreaRef}
      className="relative bg-gray-800 w-full h-full overflow-hidden border-2 border-accent select-none"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0} // Make div focusable for keyboard events if needed, though window listener is used
    >
      {/* Player */}
      <div
        className="absolute bg-blue-500"
        style={{
          width: `${PLAYER_WIDTH}px`,
          height: `${PLAYER_HEIGHT}px`,
          left: `${playerX}px`,
          bottom: `0px`,
        }}
      />

      {/* Obstacles */}
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
        />
      ))}

      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white">
          <h2 className="text-3xl font-bold font-secondary mb-4">Game Over!</h2>
          <p className="text-xl">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default CosmicRushGame;
