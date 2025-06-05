import React, { useState, useEffect, useCallback } from 'react';

const MAZE_GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 2 is the exit
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]; // 0: path, 1: wall, 2: exit

const PLAYER_START = { x: 1, y: 1 };
const CELL_SIZE = 'min(3.5vw, 30px)'; // Responsive cell size
const GAME_TIME_LIMIT = 60; // seconds

const MazeRunnerXGame = ({ onScoreUpdate, onGameOver, isRunning, isPaused, onReady }) => {
  const [playerPosition, setPlayerPosition] = useState(PLAYER_START);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameOverState, setIsGameOverState] = useState(false); // Renamed to avoid conflict with prop

  const startGame = useCallback(() => {
    setPlayerPosition(PLAYER_START);
    setTimeLeft(GAME_TIME_LIMIT);
    setScore(0);
    setIsGameActive(true);
    setIsGameWon(false);
    setIsGameOverState(false);
    if (onScoreUpdate) {
      onScoreUpdate(0);
    }
  }, [onScoreUpdate]);

  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  useEffect(() => {
    if (isRunning && (!isGameActive || isGameOverState)) {
      startGame();
    }
    // Note: We don't handle isRunning becoming false here to stop the game,
    // as GamePage typically uses pause or game over states for that.
    // If isRunning is meant to be a hard stop/reset, more logic would be needed.
  }, [isRunning, startGame, isGameActive, isGameOverState]);

  useEffect(() => {
    if (!isGameActive || isGameOverState || isPaused) return;

    const handleKeyDown = (e) => {
      let newX = playerPosition.x;
      let newY = playerPosition.y;

      if (e.key === 'ArrowUp') newY -= 1;
      else if (e.key === 'ArrowDown') newY += 1;
      else if (e.key === 'ArrowLeft') newX -= 1;
      else if (e.key === 'ArrowRight') newX += 1;
      else return;

      e.preventDefault();

      if (
        newY >= 0 && newY < MAZE_GRID.length &&
        newX >= 0 && newX < MAZE_GRID[0].length &&
        MAZE_GRID[newY][newX] !== 1 // Not a wall
      ) {
        setPlayerPosition({ x: newX, y: newY });
        if (MAZE_GRID[newY][newX] === 2) { // Reached exit
          setIsGameActive(false);
          setIsGameWon(true);
          setIsGameOverState(true);
          const finalScore = timeLeft * 10 + 1000; // Base score + time bonus
          setScore(finalScore);
          if (onGameOver) {
            onGameOver(finalScore);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameActive, isGameOverState, isPaused, playerPosition, timeLeft, onGameOver]);

  useEffect(() => {
    if (isGameActive && !isGameOverState && !isPaused) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => {
          setTimeLeft(prevTime => prevTime - 1);
          const newTimeLeft = timeLeft - 1;
          const currentScoreVal = Math.max(0, (GAME_TIME_LIMIT - newTimeLeft) * 5);
          setScore(currentScoreVal);
          if (onScoreUpdate) {
            onScoreUpdate(currentScoreVal);
          }
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Time's up
        setIsGameActive(false);
        setIsGameOverState(true);
        if (onGameOver) {
          onGameOver(score);
        }
      }
    }
  }, [isGameActive, isGameOverState, isPaused, timeLeft, score, onScoreUpdate, onGameOver]);

  // If the game hasn't been started by GamePage via isRunning, show nothing or a placeholder
  // Or, if GamePage indicates not running, but game was active, it might mean pause or stop.
  // For simplicity, we render the game area once isRunning is true or game is internally active.
  if (!isGameActive && !isGameOverState && !isRunning) {
     return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-800 p-4 rounded-lg">
            <p className="text-text-medium">Waiting for game to start...</p>
        </div>
     ); // Or some placeholder if GamePage doesn't show its own loading
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 p-2 sm:p-4 rounded-lg">
      <div className="w-full flex justify-between items-center mb-2 sm:mb-4 px-2">
        <p className="text-lg sm:text-xl text-text-light">Score: <span className='font-bold text-accent'>{score}</span></p>
        <p className="text-lg sm:text-xl text-text-light">Time: <span className='font-bold text-accent'>{timeLeft}s</span></p>
      </div>
      <div 
        className='grid border-2 border-accent rounded-md bg-gray-900'
        style={{
          gridTemplateColumns: `repeat(${MAZE_GRID[0].length}, ${CELL_SIZE})`,
          gridTemplateRows: `repeat(${MAZE_GRID.length}, ${CELL_SIZE})`,
          width: `calc(${MAZE_GRID[0].length} * ${CELL_SIZE})`,
          height: `calc(${MAZE_GRID.length} * ${CELL_SIZE})`,
          minWidth: `calc(${MAZE_GRID[0].length} * 20px)`, // ensure minimum size based on smallest cell_size part
          minHeight: `calc(${MAZE_GRID.length} * 20px)`,
        }}
      >
        {MAZE_GRID.map((row, y) =>
          row.map((cell, x) => {
            let cellContent = null;
            let cellClass = 'flex items-center justify-center';
            if (cell === 1) cellClass += ' bg-secondary-bg'; // Wall
            else if (cell === 2) cellClass += ' bg-green-500'; // Exit
            else cellClass += ' bg-gray-700'; // Path

            if (playerPosition.x === x && playerPosition.y === y) {
              cellContent = <div className='w-3/4 h-3/4 bg-accent rounded-full'></div>;
            }

            return (
              <div key={`${x}-${y}`} className={cellClass} style={{width: CELL_SIZE, height: CELL_SIZE}}>
                {cellContent}
              </div>
            );
          })
        )}
      </div>
      {isGameOverState && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center rounded-lg p-4 z-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
            {isGameWon ? 'Congratulations! You Escaped!' : 'Game Over! Time\'s Up!'}
          </h3>
          <p className="text-lg sm:text-xl text-white mb-6">Final Score: {score}</p>
          <button 
            onClick={startGame} // This Play Again button is internal to the game
            className="px-6 py-3 bg-accent text-white font-semibold rounded-lg text-xl hover:bg-pink-700 transition-colors duration-300"
          >
            Play Again
          </button>
        </div>
      )}
       {isPaused && isGameActive && !isGameOverState && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-lg p-4 z-10">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Paused</h3>
        </div>
      )}
    </div>
  );
};

export default MazeRunnerXGame;
