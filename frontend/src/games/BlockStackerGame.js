import React, { useState, useEffect, useCallback, useRef } from 'react';

const BLOCK_WIDTH_INITIAL = 100;
const BLOCK_HEIGHT = 20;
const GAME_WIDTH = 300; // Game area width
const GAME_HEIGHT = 400; // Game area height

const BlockStackerGame = ({ onScoreUpdate, onGameOver }) => {
  const [stackedBlocks, setStackedBlocks] = useState([
    { x: GAME_WIDTH / 2 - BLOCK_WIDTH_INITIAL / 2, y: GAME_HEIGHT - BLOCK_HEIGHT, width: BLOCK_WIDTH_INITIAL, id: 'base' },
  ]);
  const [currentBlock, setCurrentBlock] = useState({
    x: 0,
    y: 0,
    width: BLOCK_WIDTH_INITIAL,
    speed: 3,
    direction: 1, // 1 for right, -1 for left
  });
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const animationFrameId = useRef(null);

  const gameTick = useCallback(() => {
    if (isGameOver) return;

    setCurrentBlock(prev => {
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
  }, [isGameOver]);

  const dropBlock = useCallback(() => {
    if (isGameOver) return;

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
      setScore(prevScore => prevScore + 1);
      onScoreUpdate(score + 1);

      setCurrentBlock(prev => ({
        ...prev,
        y: 0, // Reset to top for next block
        width: overlap, // Next block width is current overlap
        x: 0, // Reset position
        speed: prev.speed + 0.2, // Increase speed slightly
      }));

      if (newStackedBlock.y < BLOCK_HEIGHT * 2) { // Check if near top
         // Potentially add a win condition or just keep going
      }

    } else {
      setIsGameOver(true);
      onGameOver(score);
    }
  }, [currentBlock, stackedBlocks, score, isGameOver, onGameOver, onScoreUpdate]);

  useEffect(() => {
    animationFrameId.current = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [gameTick]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault(); // Prevent page scroll
        dropBlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropBlock]);

  return (
    <div 
      className="relative bg-gray-800 w-full h-full overflow-hidden border-2 border-accent select-none"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0}
    >
      {/* Stacked Blocks */}
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

      {/* Current Moving Block */}
      {!isGameOver && (
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

      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white">
          <h2 className="text-3xl font-bold font-secondary mb-4">Game Over!</h2>
          <p className="text-xl">Final Score: {score}</p>
        </div>
      )}
    </div>
  );
};

export default BlockStackerGame;
