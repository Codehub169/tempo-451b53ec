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
  const gameAreaRef = useRef(null);
  const blockIdCounter = useRef(1); // Start at 1 since 'base' can be 0 or string

  const resetGame = useCallback(() => {
    const baseBlock = { x: GAME_WIDTH / 2 - BLOCK_WIDTH_INITIAL / 2, y: GAME_HEIGHT - BLOCK_HEIGHT, width: BLOCK_WIDTH_INITIAL, id: 'base', color: 'bg-gray-400 border-gray-600' };
    setStackedBlocks([baseBlock]);
    setCurrentBlock({
      x: 0,
      y: GAME_HEIGHT - BLOCK_HEIGHT * 2, 
      width: BLOCK_WIDTH_INITIAL,
      speed: INITIAL_SPEED,
      direction: 1, 
      color: 'bg-cyan-400 border-cyan-600'
    });
    setScore(0);
    setInternalIsGameOver(false);
    setIsGameActive(true);
    blockIdCounter.current = 1;
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

  useEffect(() => {
    if (isGameActive && !internalIsGameOver && !isPaused && gameAreaRef.current) {
      gameAreaRef.current.focus({ preventScroll: true });
    }
  }, [isGameActive, internalIsGameOver, isPaused]);

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
      if (!prev) return null; 
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
        id: blockIdCounter.current++,
        color: currentBlock.color
      };
      setStackedBlocks(prev => [...prev, newStackedBlock]);
      
      const newScore = score + 1;
      setScore(newScore);
      if (onScoreUpdate) onScoreUpdate(newScore);
      
      const nextBlockColors = ['bg-purple-500 border-purple-700', 'bg-pink-500 border-pink-700', 'bg-orange-500 border-orange-700', 'bg-lime-500 border-lime-700'];
      const nextColor = nextBlockColors[newScore % nextBlockColors.length];

      const newCurrentBlockX = Math.random() < 0.5 ? 0 : GAME_WIDTH - overlap;
      const newCurrentBlockDirection = newCurrentBlockX === 0 ? 1 : -1;

      setCurrentBlock({
        y: newStackedBlock.y - BLOCK_HEIGHT, 
        width: overlap, 
        x: newCurrentBlockX, 
        speed: currentBlock.speed + SPEED_INCREMENT, 
        direction: newCurrentBlockDirection,
        color: nextColor
      });

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
    } else {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [gameTick, isGameActive, internalIsGameOver, isPaused, currentBlock]);

  const handleKeyDown = useCallback((e) => {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault(); 
      e.stopPropagation();
      dropBlock();
    }
  }, [dropBlock]);

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
      tabIndex={0} 
      className="relative bg-gray-800 w-full h-full overflow-hidden border-2 border-accent select-none touch-manipulation cursor-pointer"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      onClick={isGameActive && !internalIsGameOver && !isPaused ? dropBlock : undefined}
    >
      {stackedBlocks.map(block => (
        <div
          key={block.id}
          className={`absolute ${block.color} transition-all duration-100 ease-linear`}
          style={{
            left: `${block.x}px`,
            top: `${block.y}px`,
            width: `${block.width}px`,
            height: `${BLOCK_HEIGHT}px`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.2)'
          }}
        />
      ))}

      {isGameActive && !internalIsGameOver && !isPaused && currentBlock && (
        <div
          className={`absolute ${currentBlock.color}`}
          style={{
            left: `${currentBlock.x}px`,
            top: `${currentBlock.y}px`,
            width: `${currentBlock.width}px`,
            height: `${BLOCK_HEIGHT}px`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(255,255,255,0.2)'
          }}
        />
      )}

      {internalIsGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white z-10">
          <h2 className="text-3xl font-bold font-secondary mb-4">Game Over!</h2>
          <p className="text-xl">Final Score: {score}</p>
        </div>
      )}

      {isGameActive && !internalIsGameOver && !isPaused && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center z-20 md:hidden">
          <button 
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); if(!isPaused) dropBlock(); }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); if(!isPaused) dropBlock(); }}
            className="px-12 py-6 bg-accent/80 text-white rounded-lg text-lg font-bold active:bg-accent shadow-lg select-none"
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
