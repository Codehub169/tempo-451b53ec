import React, { useState, useEffect, useCallback, useRef } from 'react';

const BLOCK_WIDTH_INITIAL = 100;
const BLOCK_HEIGHT = 20;
const GAME_WIDTH = 300; // Game area width
const GAME_HEIGHT = 400; // Game area height
const INITIAL_SPEED = 3;
const SPEED_INCREMENT = 0.2;

const BlockStackerGame = ({ onScoreUpdate, onGameOver, isRunning, isPaused, onReady }) => {
  const [stackedBlocks, setStackedBlocks] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [score, setScore] = useState(0);
  const [internalIsGameOver, setInternalIsGameOver] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const animationFrameId = useRef(null);

  const resetGame = useCallback(() => {
    const baseBlock = { x: GAME_WIDTH / 2 - BLOCK_WIDTH_INITIAL / 2, y: GAME_HEIGHT - BLOCK_HEIGHT, width: BLOCK_WIDTH_INITIAL, id: 'base' };
    setStackedBlocks([baseBlock]);
    setCurrentBlock({
      x: 0,
      y: GAME_HEIGHT - BLOCK_HEIGHT * 2, // Start above the base block
      width: BLOCK_WIDTH_INITIAL,
      speed: INITIAL_SPEED,
      direction: 1, // 1 for right, -1 for left
    });
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


  const gameTick = useCallback(() => {
    if (internalIsGameOver || !isGameActive || !currentBlock) {
        if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        return;
    }
    if (isPaused) {
        animationFrameId.current = requestAnimationFrame(gameTick); 
        return;
    }

    setCurrentBlock(prev => {
      if (!prev) return null; // Should not happen if !currentBlock guard is effective
      let newX = prev.x + prev.speed * prev.direction;
      let newDirection = prev.direction;

      if (newX + prev.width > GAME_WIDTH) {
        newX = GAME_WIDTH - prev.width;
        newDirection = -1;
      }
      if (newX < 0) {
        newX = 0;
        newDirection = 1;
      }
      return { ...prev, x: newX, direction: newDirection };
    });

    animationFrameId.current = requestAnimationFrame(gameTick);
  }, [internalIsGameOver, isGameActive, isPaused, currentBlock]);

  const dropBlock = useCallback(() => {
    if (internalIsGameOver || !isGameActive || isPaused || !currentBlock) return;

    const topStackedBlock = stackedBlocks[stackedBlocks.length - 1];
    const overlap = Math.max(0, Math.min(currentBlock.x + currentBlock.width, topStackedBlock.x + topStackedBlock.width) - Math.max(currentBlock.x, topStackedBlock.x));

    if (overlap > 0) {
      const newBlockX = Math.max(currentBlock.x, topStackedBlock.x);
      const newStackedBlock = {
        x: newBlockX,
        y: topStackedBlock.y - BLOCK_HEIGHT,
        width: overlap,
        id: Date.now(),
      };
      setStackedBlocks(prev => [...prev, newStackedBlock]);
      
      const newScore = score + 1;
      setScore(newScore);
      if (onScoreUpdate) onScoreUpdate(newScore);

      // Optional: Game gets harder or ends if tower is too high
      // if (newStackedBlock.y < BLOCK_HEIGHT) { ... }
      
      setCurrentBlock(prev => ({
        ...prev,
        y: newStackedBlock.y - BLOCK_HEIGHT, 
        width: overlap, 
        x: Math.random() < 0.5 ? 0 : GAME_WIDTH - overlap, // Start next block from random side
        speed: prev.speed + SPEED_INCREMENT, 
        direction: prev.x === 0 ? 1 : -1, // Ensure it moves inwards initially
      }));

    } else {
      setInternalIsGameOver(true);
      setIsGameActive(false);
      if (onGameOver) onGameOver(score);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [currentBlock, stackedBlocks, score, internalIsGameOver, onGameOver, onScoreUpdate, isGameActive, isPaused]);

  useEffect(() => {
    if (isGameActive && !internalIsGameOver && !isPaused && currentBlock) {
        animationFrameId.current = requestAnimationFrame(gameTick);
    }
    return () => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [gameTick, isGameActive, internalIsGameOver, isPaused, currentBlock]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault(); 
        dropBlock();
      }
    };
    // Add listener only when game is in a state to accept input
    if (isGameActive && !internalIsGameOver && !isPaused) {
        window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropBlock, isGameActive, internalIsGameOver, isPaused]); // dropBlock is stable if its deps are stable
  
  if (!isGameActive && !isRunning && !internalIsGameOver) {
    return (
      <div className="flex items-center justify-center w-full h-full text-text-medium">
        Press Start to Play
      </div>
    );
  }

  return (
    <div 
      className="relative bg-gray-800 w-full h-full overflow-hidden border-2 border-accent select-none touch-manipulation"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0}
    >
      {stackedBlocks.map(block => (
        <div
          key={block.id}
          className="absolute bg-green-500 border border-green-700"
          style={{
            left: `${block.x}px`,
            top: `${block.y}px`,
            width: `${block.width}px`,
            height: `${BLOCK_HEIGHT}px`,
          }}
        />
      ))}

      {isGameActive && !internalIsGameOver && currentBlock && (
        <div
          className="absolute bg-blue-500 border border-blue-700"
          style={{
            left: `${currentBlock.x}px`,
            top: `${currentBlock.y}px`,
            width: `${currentBlock.width}px`,
            height: `${BLOCK_HEIGHT}px`,
          }}
        />
      )}

      {internalIsGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white z-10">
          <h2 className="text-3xl font-bold font-secondary mb-4">Game Over!</h2>
          <p className="text-xl">Final Score: {score}</p>
        </div>
      )}

      {isGameActive && !internalIsGameOver && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center z-20">
          <button 
            onClick={dropBlock}
            onTouchStart={(e) => { e.preventDefault(); dropBlock(); }}
            className="px-10 py-5 bg-accent/80 text-white rounded-lg text-xl font-bold active:bg-accent shadow-lg"
          >
            Drop Block
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

export default BlockStackerGame;
