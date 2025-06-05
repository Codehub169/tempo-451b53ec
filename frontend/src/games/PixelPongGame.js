import React, { useState, useEffect, useCallback, useRef } from 'react';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 10;
const PADDLE_SPEED = 20;
const AI_PADDLE_SPEED = 4;

const PixelPongGame = ({ onScoreUpdate, onGameOver }) => {
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 5, dy: 3 });
  const [playerY, setPlayerY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false); // Not strictly game over, but round over
  const animationFrameId = useRef(null);

  const MAX_SCORE = 5; // Game ends when someone reaches this score

  const resetBall = useCallback((servedByPlayer) => {
    setBall({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      dx: (servedByPlayer ? 1 : -1) * (Math.random() > 0.5 ? 5 : -5), // Random initial horizontal direction
      dy: Math.random() > 0.5 ? 3 : -3, // Random initial vertical direction
    });
  }, []);

  const gameTick = useCallback(() => {
    if (isGameOver) return;

    // Ball movement
    let newBall = { ...ball };
    newBall.x += newBall.dx;
    newBall.y += newBall.dy;

    // Ball collision with top/bottom walls
    if (newBall.y <= 0 || newBall.y >= GAME_HEIGHT - BALL_SIZE) {
      newBall.dy *= -1;
    }

    // Ball collision with player paddle (left)
    if (
      newBall.x <= PADDLE_WIDTH &&
      newBall.x > 0 && // ensure it's not already past
      newBall.y + BALL_SIZE >= playerY &&
      newBall.y <= playerY + PADDLE_HEIGHT
    ) {
      newBall.dx *= -1.1; // Increase speed slightly and reverse direction
      newBall.x = PADDLE_WIDTH; // Prevent sticking
    }

    // Ball collision with AI paddle (right)
    if (
      newBall.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
      newBall.x + BALL_SIZE < GAME_WIDTH && // ensure it's not already past
      newBall.y + BALL_SIZE >= aiY &&
      newBall.y <= aiY + PADDLE_HEIGHT
    ) {
      newBall.dx *= -1.1; // Increase speed slightly and reverse direction
      newBall.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE; // Prevent sticking
    }

    // Scoring
    if (newBall.x < 0) { // AI scores
      setAiScore(s => s + 1);
      onScoreUpdate({player: playerScore, ai: aiScore + 1}); // Update with new scores
      if (aiScore + 1 >= MAX_SCORE) {
        setIsGameOver(true);
        onGameOver({player: playerScore, ai: aiScore + 1, winner: 'AI'});
        return;
      }
      resetBall(true); // Player serves
    } else if (newBall.x > GAME_WIDTH) { // Player scores
      setPlayerScore(s => s + 1);
      onScoreUpdate({player: playerScore + 1, ai: aiScore}); // Update with new scores
      if (playerScore + 1 >= MAX_SCORE) {
        setIsGameOver(true);
        onGameOver({player: playerScore + 1, ai: aiScore, winner: 'Player'});
        return;
      }
      resetBall(false); // AI serves
    }
    
    setBall(newBall);

    // AI Paddle Movement (simple tracking)
    setAiY(prevAiY => {
      const targetY = newBall.y - PADDLE_HEIGHT / 2;
      let newAiY = prevAiY;
      if (newAiY < targetY) newAiY += AI_PADDLE_SPEED;
      if (newAiY > targetY) newAiY -= AI_PADDLE_SPEED;
      return Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newAiY));
    });

    animationFrameId.current = requestAnimationFrame(gameTick);
  }, [ball, playerY, aiY, playerScore, aiScore, isGameOver, onGameOver, onScoreUpdate, resetBall]);

  useEffect(() => {
    resetBall(true); // Player serves first
    animationFrameId.current = requestAnimationFrame(gameTick);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [gameTick, resetBall]); // Start on mount

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver) return;
      if (e.key === 'w' || e.key === 'W') {
        setPlayerY(y => Math.max(0, y - PADDLE_SPEED));
      } else if (e.key === 's' || e.key === 'S') {
        setPlayerY(y => Math.min(GAME_HEIGHT - PADDLE_HEIGHT, y + PADDLE_SPEED));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  return (
    <div 
      className="relative bg-black w-full h-full border-2 border-accent select-none"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0}
    >
      {/* Player Paddle (Left) */}
      <div
        className="absolute bg-white"
        style={{
          width: `${PADDLE_WIDTH}px`,
          height: `${PADDLE_HEIGHT}px`,
          left: `0px`,
          top: `${playerY}px`,
        }}
      />
      {/* AI Paddle (Right) */}
      <div
        className="absolute bg-white"
        style={{
          width: `${PADDLE_WIDTH}px`,
          height: `${PADDLE_HEIGHT}px`,
          right: `0px`,
          top: `${aiY}px`,
        }}
      />
      {/* Ball */}
      <div
        className="absolute bg-white rounded-full"
        style={{
          width: `${BALL_SIZE}px`,
          height: `${BALL_SIZE}px`,
          left: `${ball.x}px`,
          top: `${ball.y}px`,
        }}
      />
      {/* Score Display */}
      <div className="absolute top-4 left-1/4 text-white text-3xl font-secondary">{playerScore}</div>
      <div className="absolute top-4 right-1/4 text-white text-3xl font-secondary">{aiScore}</div>

      {/* Dashed Center Line (optional) */}
      <div className="absolute left-1/2 top-0 w-px h-full">
        {Array.from({ length: Math.floor(GAME_HEIGHT / 20) }).map((_, i) => (
          <div key={i} className="bg-gray-600 h-2.5 w-0.5 my-1.25 mx-auto" style={{height: '10px', width:'2px', margin:'5px auto'}}></div>
        ))}
      </div>

      {isGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-85 text-white">
          <h2 className="text-4xl font-bold font-secondary mb-4">Game Over!</h2>
          <p className="text-2xl mb-2">{playerScore > aiScore ? 'You Win!' : 'AI Wins!'}</p>
          <p className="text-xl">Final Score: Player {playerScore} - AI {aiScore}</p>
        </div>
      )}
    </div>
  );
};

export default PixelPongGame;
