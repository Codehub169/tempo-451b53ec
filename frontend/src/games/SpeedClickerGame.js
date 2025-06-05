import React, { useState, useEffect, useCallback } from 'react';

const GAME_DURATION = 10; // seconds
const TARGET_SIZE = 60; // pixels

const SpeedClickerGame = ({ onScoreUpdate, onGameOver }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: '50%', left: '50%' });
  const [gameAreaSize, setGameAreaSize] = useState({ width: 0, height: 0 });

  const gameAreaRef = useCallback(node => {
    if (node !== null) {
      setGameAreaSize({ width: node.offsetWidth, height: node.offsetHeight });
    }
  }, []);

  const moveTarget = useCallback(() => {
    if (gameAreaSize.width > TARGET_SIZE && gameAreaSize.height > TARGET_SIZE) {
      const newTop = Math.random() * (gameAreaSize.height - TARGET_SIZE);
      const newLeft = Math.random() * (gameAreaSize.width - TARGET_SIZE);
      setTargetPosition({ top: `${newTop}px`, left: `${newLeft}px` });
    }
  }, [gameAreaSize]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setIsActive(true);
    setIsGameOver(false);
    onScoreUpdate(0);
    moveTarget(); // Initial target position
  }, [onScoreUpdate, moveTarget]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsGameOver(true);
      onGameOver(score);
    }
  }, [isActive, timeLeft, score, onGameOver]);

  const handleTargetClick = () => {
    if (!isActive || isGameOver) return;
    const newScore = score + 1;
    setScore(newScore);
    onScoreUpdate(newScore);
    moveTarget();
  };

  if (!isActive && !isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800 p-4 rounded-lg">
        <h2 className="text-3xl font-bold text-accent mb-6">Speed Clicker</h2>
        <button 
          onClick={startGame}
          className="px-6 py-3 bg-accent text-white font-semibold rounded-lg text-xl hover:bg-pink-700 transition-colors duration-300"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800 p-4 rounded-lg relative" ref={gameAreaRef}>
      <div className="w-full flex justify-between items-center mb-4 absolute top-4 left-4 right-4 px-4">
        <p className="text-2xl text-text-light">Score: <span className='font-bold text-accent'>{score}</span></p>
        <p className="text-2xl text-text-light">Time Left: <span className='font-bold text-accent'>{timeLeft}s</span></p>
      </div>

      {isActive && (
        <button
          onClick={handleTargetClick}
          className="absolute bg-accent rounded-full transition-all duration-100 ease-out focus:outline-none transform hover:scale-110 active:scale-95 shadow-lg"
          style={{
            width: `${TARGET_SIZE}px`,
            height: `${TARGET_SIZE}px`,
            top: targetPosition.top,
            left: targetPosition.left,
            transform: `translate(-50%, -50%)` // Center the target on its coordinates
          }}
          aria-label="Click target"
        />
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center rounded-lg">
          <h3 className="text-3xl font-bold text-white mb-4">Game Over!</h3>
          <p className="text-xl text-white mb-6">Final Score: {score}</p>
          <button 
            onClick={startGame}
            className="px-6 py-3 bg-accent text-white font-semibold rounded-lg text-xl hover:bg-pink-700 transition-colors duration-300"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeedClickerGame;
