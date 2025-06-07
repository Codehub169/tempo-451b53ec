import React, { useState, useEffect, useCallback, useRef } from 'react';

const MAZE_GRID_DATA = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], 
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]; 

const PLAYER_START_POS = { x: 1, y: 1 };
const CELL_SIZE_CSS = 'min(max(2.5vw, 16px), 28px)';
const GAME_TIME_LIMIT_SECONDS = 60;
const SCORE_PER_SECOND_PASSED = 5;
const WIN_BASE_SCORE = 1000;
const WIN_TIME_BONUS_MULTIPLIER = 10;

const MazeRunnerXGame = ({ onScoreUpdate, onGameOver, isRunning, isPaused, onReady }) => {
  const [mazeGrid] = useState(MAZE_GRID_DATA);
  const [playerPosition, setPlayerPosition] = useState(PLAYER_START_POS);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT_SECONDS);
  const [score, setScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [internalIsGameOver, setInternalIsGameOver] = useState(false);
  const gameAreaRef = useRef(null);

  const startGame = useCallback(() => {
    setPlayerPosition(PLAYER_START_POS);
    setTimeLeft(GAME_TIME_LIMIT_SECONDS);
    setScore(0);
    setIsGameActive(true);
    setIsGameWon(false);
    setInternalIsGameOver(false);
    if (onScoreUpdate) onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    if (onReady) onReady();
  }, [onReady]);

  useEffect(() => {
    if (isRunning && (!isGameActive || internalIsGameOver)) {
      startGame();
    }
  }, [isRunning, startGame, isGameActive, internalIsGameOver]);

  useEffect(() => {
    if (isGameActive && !internalIsGameOver && !isPaused && gameAreaRef.current) {
      gameAreaRef.current.focus({ preventScroll: true });
    }
  }, [isGameActive, internalIsGameOver, isPaused]);

  const movePlayer = useCallback((dx, dy) => {
    // Game state checks are handled by callers (handleKeyDown, touch controls)
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;

    if (
      newY >= 0 && newY < mazeGrid.length &&
      newX >= 0 && newX < mazeGrid[0].length &&
      mazeGrid[newY][newX] !== 1
    ) {
      setPlayerPosition({ x: newX, y: newY });
      if (mazeGrid[newY][newX] === 2) {
        setIsGameActive(false);
        setIsGameWon(true);
        setInternalIsGameOver(true);
        const finalScoreOnWin = WIN_BASE_SCORE + timeLeft * WIN_TIME_BONUS_MULTIPLIER; 
        setScore(finalScoreOnWin);
        if (onGameOver) onGameOver(finalScoreOnWin);
      }
    }
  }, [playerPosition, mazeGrid, timeLeft, onGameOver, setIsGameActive, setIsGameWon, setInternalIsGameOver, setScore]);

  const handleKeyDown = useCallback((e) => {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrowKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!isGameActive || internalIsGameOver || isPaused) return;
    
    if (e.key === 'ArrowUp') movePlayer(0, -1);
    else if (e.key === 'ArrowDown') movePlayer(0, 1);
    else if (e.key === 'ArrowLeft') movePlayer(-1, 0);
    else if (e.key === 'ArrowRight') movePlayer(1, 0);
  }, [movePlayer, isGameActive, internalIsGameOver, isPaused]);

  useEffect(() => {
    const gameElement = gameAreaRef.current;
    if (gameElement && isGameActive && !internalIsGameOver && !isPaused) {
      gameElement.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (gameElement) {
        gameElement.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [handleKeyDown, isGameActive, internalIsGameOver, isPaused]);

  useEffect(() => {
    let timer;
    if (isGameActive && !internalIsGameOver && !isPaused) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          const newTimeLeft = timeLeft - 1;
          setTimeLeft(newTimeLeft);
          if (!isGameWon) {
            const currentScoreVal = Math.max(0, (GAME_TIME_LIMIT_SECONDS - newTimeLeft) * SCORE_PER_SECOND_PASSED);
            setScore(currentScoreVal);
            if (onScoreUpdate) onScoreUpdate(currentScoreVal);
          }
        }, 1000);
      } else {
        if (!isGameWon) {
            setIsGameActive(false);
            setInternalIsGameOver(true);
            if (onGameOver) onGameOver(score);
        }
      }
    }
    return () => clearTimeout(timer);
  }, [isGameActive, internalIsGameOver, isPaused, timeLeft, score, onScoreUpdate, onGameOver, isGameWon]);
  
  if (!isGameActive && !isRunning && !internalIsGameOver) {
     return (
        <div className="flex flex-col items-center justify-center h-full bg-primary-bg p-4 rounded-lg text-text-medium">
            Press Start to Play
        </div>
     );
  }
  
  return (
    <div 
      className="flex flex-col items-center justify-center h-full bg-primary-bg p-1 sm:p-2 rounded-lg relative touch-manipulation cursor-default select-none"
      ref={gameAreaRef}
      tabIndex={0}
    >
      <div className="w-full flex justify-between items-center mb-2 sm:mb-4 px-1 sm:px-2">
        <p className="text-sm sm:text-lg md:text-xl text-text-light">Score: <span className='font-bold text-accent'>{score}</span></p>
        <p className="text-sm sm:text-lg md:text-xl text-text-light">Time: <span className='font-bold text-accent'>{timeLeft}s</span></p>
      </div>
      <div 
        className='grid border-2 border-accent rounded-md bg-gray-900 shadow-xl'
        style={{
          gridTemplateColumns: `repeat(${mazeGrid[0].length}, ${CELL_SIZE_CSS})`,
          gridTemplateRows: `repeat(${mazeGrid.length}, ${CELL_SIZE_CSS})`,
          outline: 'none'
        }}
      >
        {mazeGrid.map((row, y) =>
          row.map((cell, x) => {
            let cellContent = null;
            let cellClass = 'flex items-center justify-center';
            if (cell === 1) cellClass += ' bg-gray-600';
            else if (cell === 2) cellClass += ' bg-emerald-500';
            else cellClass += ' bg-gray-800';

            if (playerPosition.x === x && playerPosition.y === y) {
              cellContent = <div className='w-3/4 h-3/4 bg-orange-500 rounded-full shadow-md' role="img" aria-label="Player"></div>;
            }
            let ariaCellLabel = "Path";
            if (cell === 1) ariaCellLabel = "Wall";
            if (cell === 2) ariaCellLabel = "Exit";
            if (playerPosition.x === x && playerPosition.y === y) ariaCellLabel += ", Player current position";

            return (
              <div 
                key={`${x}-${y}`} 
                className={cellClass} 
                style={{width: CELL_SIZE_CSS, height: CELL_SIZE_CSS}}
                role="gridcell"
                aria-label={ariaCellLabel}
              >
                {cellContent}
              </div>
            );
          })
        )}
      </div>
      
      {isGameActive && !internalIsGameOver && !isPaused && (
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 opacity-80 hover:opacity-100 transition-opacity md:hidden">
            <div className="grid grid-cols-3 gap-1 w-32 h-32 sm:w-36 sm:h-36">
                <div className="col-start-2 flex justify-center items-center">
                    <button onTouchStart={(e) => {e.preventDefault(); if(!isPaused) movePlayer(0, -1);}} onMouseDown={(e) => {e.preventDefault(); if(!isPaused) movePlayer(0,-1);}} className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-bg/80 border border-accent text-accent rounded-md active:bg-accent active:text-white flex justify-center items-center text-xl font-bold shadow-lg" aria-label="Move Up">	
                </div>
                <div className="flex justify-center items-center">
                    <button onTouchStart={(e) => {e.preventDefault(); if(!isPaused) movePlayer(-1, 0);}} onMouseDown={(e) => {e.preventDefault(); if(!isPaused) movePlayer(-1,0);}} className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-bg/80 border border-accent text-accent rounded-md active:bg-accent active:text-white flex justify-center items-center text-xl font-bold shadow-lg" aria-label="Move Left">	
                </div>
                <div className="flex justify-center items-center">
                </div>
                <div className="flex justify-center items-center">
                    <button onTouchStart={(e) => {e.preventDefault(); if(!isPaused) movePlayer(1, 0);}} onMouseDown={(e) => {e.preventDefault(); if(!isPaused) movePlayer(1,0);}} className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-bg/80 border border-accent text-accent rounded-md active:bg-accent active:text-white flex justify-center items-center text-xl font-bold shadow-lg" aria-label="Move Right">	
                </div>
                <div className="col-start-2 flex justify-center items-center">
                    <button onTouchStart={(e) => {e.preventDefault(); if(!isPaused) movePlayer(0, 1);}} onMouseDown={(e) => {e.preventDefault(); if(!isPaused) movePlayer(0,1);}} className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-bg/80 border border-accent text-accent rounded-md active:bg-accent active:text-white flex justify-center items-center text-xl font-bold shadow-lg" aria-label="Move Down">	
                </div>
            </div>
        </div>
      )}

      {internalIsGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-85 flex flex-col items-center justify-center rounded-lg p-4 z-30">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            {isGameWon ? 'Congratulations! You Escaped!' : 'Game Over! Time\'s Up!'}
          </h3>
          <p className="text-base sm:text-lg md:text-xl text-white mb-6">Final Score: {score}</p>
        </div>
      )}
       {isPaused && isGameActive && !internalIsGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-lg p-4 z-40">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Paused</h3>
        </div>
      )}
    </div>
  );
};

export default MazeRunnerXGame;
