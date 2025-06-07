import React, { useState, useEffect, useCallback, useRef } from 'react';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 12;
const PLAYER_PADDLE_SPEED = 20;
const AI_PADDLE_SPEED_BASE = 3.5; 
const MAX_BALL_SPEED_X = 10;
const MAX_BALL_SPEED_Y = 7;
const BALL_SPEED_INCREASE_FACTOR = 1.03;

const PixelPongGame = ({ onScoreUpdate, onGameOver, isRunning, isPaused, onReady }) => {
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 0, dy: 0 });
  const [playerY, setPlayerY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [aiY, setAiY] = useState(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [internalIsGameOver, setInternalIsGameOver] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [winner, setWinner] = useState(null);
  const animationFrameId = useRef(null);
  const gameAreaRef = useRef(null);

  const MAX_SCORE = 5;

  const resetBall = useCallback((servedByPlayer) => {
    setBall({
      x: GAME_WIDTH / 2 - BALL_SIZE / 2,
      y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
      dx: (servedByPlayer ? 1 : -1) * (Math.random() > 0.5 ? 4.5 : -4.5), 
      dy: (Math.random() > 0.5 ? 3 : -3) * (Math.random() * 0.5 + 0.75),
    });
  }, []);

  const resetGame = useCallback(() => {
    setPlayerY(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setAiY(GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2);
    setPlayerScore(0);
    setAiScore(0);
    setInternalIsGameOver(false);
    setIsGameActive(true);
    setWinner(null);
    if (onScoreUpdate) onScoreUpdate({ player: 0, ai: 0 });
    resetBall(Math.random() > 0.5);
  }, [onScoreUpdate, resetBall]);

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
    if (internalIsGameOver || !isGameActive) {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        return;
    }
    if (isPaused) {
        animationFrameId.current = requestAnimationFrame(gameTick);
        return;
    }

    let newBall = { ...ball };
    newBall.x += newBall.dx;
    newBall.y += newBall.dy;

    if (newBall.y <= 0 || newBall.y + BALL_SIZE >= GAME_HEIGHT) {
      newBall.dy *= -1;
      newBall.y = newBall.y <=0 ? 0 : GAME_HEIGHT - BALL_SIZE;
    }

    if (
      newBall.dx < 0 &&
      newBall.x <= PADDLE_WIDTH &&
      newBall.x > 0 &&
      newBall.y + BALL_SIZE >= playerY &&
      newBall.y <= playerY + PADDLE_HEIGHT
    ) {
      newBall.dx *= -BALL_SPEED_INCREASE_FACTOR;
      newBall.x = PADDLE_WIDTH;
      const hitPos = (newBall.y + BALL_SIZE / 2 - playerY) / PADDLE_HEIGHT;
      newBall.dy += (hitPos - 0.5) * 5;
    }

    if (
      newBall.dx > 0 &&
      newBall.x + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
      newBall.x + BALL_SIZE < GAME_WIDTH &&
      newBall.y + BALL_SIZE >= aiY &&
      newBall.y <= aiY + PADDLE_HEIGHT
    ) {
      newBall.dx *= -BALL_SPEED_INCREASE_FACTOR; 
      newBall.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE;
      const hitPos = (newBall.y + BALL_SIZE / 2 - aiY) / PADDLE_HEIGHT;
      newBall.dy += (hitPos - 0.5) * 5;
    }
    
    newBall.dx = Math.max(-MAX_BALL_SPEED_X, Math.min(MAX_BALL_SPEED_X, newBall.dx));
    newBall.dy = Math.max(-MAX_BALL_SPEED_Y, Math.min(MAX_BALL_SPEED_Y, newBall.dy));

    setBall(newBall);

    if (newBall.x < -BALL_SIZE) {
      const newAiScore = aiScore + 1;
      setAiScore(newAiScore);
      if (onScoreUpdate) onScoreUpdate({ player: playerScore, ai: newAiScore });
      if (newAiScore >= MAX_SCORE) {
        setInternalIsGameOver(true);
        setIsGameActive(false);
        setWinner('AI');
        if (onGameOver) onGameOver({ player: playerScore, ai: newAiScore, winner: 'AI', score: playerScore });
        return;
      }
      resetBall(true);
    } else if (newBall.x > GAME_WIDTH) {
      const newPlayerScore = playerScore + 1;
      setPlayerScore(newPlayerScore);
      if (onScoreUpdate) onScoreUpdate({ player: newPlayerScore, ai: aiScore });
      if (newPlayerScore >= MAX_SCORE) {
        setInternalIsGameOver(true);
        setIsGameActive(false);
        setWinner('Player');
        if (onGameOver) onGameOver({ player: newPlayerScore, ai: aiScore, winner: 'Player', score: newPlayerScore });
        return;
      }
      resetBall(false);
    }

    const currentBallDxForAI = newBall.dx;
    setAiY(prevAiY => {
      const ballCenterY = newBall.y + BALL_SIZE / 2;
      const paddleCenterY = prevAiY + PADDLE_HEIGHT / 2;
      let difficultyFactor = Math.min(1, Math.abs(currentBallDxForAI) / (MAX_BALL_SPEED_X * 0.7));
      let currentAiSpeed = AI_PADDLE_SPEED_BASE * difficultyFactor + (AI_PADDLE_SPEED_BASE * 0.75 * Math.min(playerScore, aiScore) / MAX_SCORE);
      currentAiSpeed = Math.min(currentAiSpeed, PADDLE_HEIGHT / 4);

      if (currentBallDxForAI > 0) {
        if (paddleCenterY < ballCenterY - PADDLE_HEIGHT * 0.1) {
            return Math.min(GAME_HEIGHT - PADDLE_HEIGHT, prevAiY + currentAiSpeed);
        } else if (paddleCenterY > ballCenterY + PADDLE_HEIGHT * 0.1) {
            return Math.max(0, prevAiY - currentAiSpeed);
        }
      }
      return prevAiY;
    });

    animationFrameId.current = requestAnimationFrame(gameTick);
  }, [
    ball, playerY, aiY, playerScore, aiScore, internalIsGameOver, 
    onGameOver, onScoreUpdate, resetBall, isGameActive, isPaused
  ]);

  useEffect(() => {
    if (isGameActive && !internalIsGameOver && !isPaused) {
        animationFrameId.current = requestAnimationFrame(gameTick);
    } else {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    }
  }, [gameTick, isGameActive, internalIsGameOver, isPaused]);

  const movePlayerPaddle = useCallback((direction) => {
    setPlayerY(y => {
        const newY = direction === 'up' ? y - PLAYER_PADDLE_SPEED : y + PLAYER_PADDLE_SPEED;
        return Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY));
    });
  }, []);

  const handleKeyDown = useCallback((e) => {
    const relevantKeys = ['w', 'W', 'ArrowUp', 's', 'S', 'ArrowDown'];
    if (relevantKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (internalIsGameOver || !isGameActive || isPaused) return;

    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
      movePlayerPaddle('up');
    } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
      movePlayerPaddle('down');
    }
  }, [movePlayerPaddle, internalIsGameOver, isGameActive, isPaused]);

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
      className="relative bg-black w-full h-full border-2 border-accent select-none touch-manipulation cursor-default"
      style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      tabIndex={0}
    >
      <div
        className="absolute bg-blue-400 shadow-md rounded-sm"
        style={{
          width: `${PADDLE_WIDTH}px`,
          height: `${PADDLE_HEIGHT}px`,
          left: `0px`,
          top: `${playerY}px`,
        }}
        role="img" aria-label="Player Paddle"
      />
      <div
        className="absolute bg-red-400 shadow-md rounded-sm"
        style={{
          width: `${PADDLE_WIDTH}px`,
          height: `${PADDLE_HEIGHT}px`,
          right: `0px`,
          top: `${aiY}px`,
        }}
        role="img" aria-label="AI Paddle"
      />
      {isGameActive && !internalIsGameOver && !isPaused && (
        <div
          className="absolute bg-yellow-300 rounded-full shadow-lg"
          style={{
            width: `${BALL_SIZE}px`,
            height: `${BALL_SIZE}px`,
            left: `${ball.x}px`,
            top: `${ball.y}px`,
          }}
          role="img" aria-label="Ball"
        />
      )}
      <div className="absolute top-4 left-1/4 text-white text-4xl font-secondary select-none font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{playerScore}</div>
      <div className="absolute top-4 right-1/4 text-white text-4xl font-secondary select-none font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{aiScore}</div>

      <div className="absolute left-1/2 top-0 w-px h-full transform -translate-x-1/2">
        {Array.from({ length: Math.floor(GAME_HEIGHT / 20) }).map((_, i) => (
          <div key={i} className="bg-gray-700" style={{height: '10px', width:'3px', margin:'5px auto', borderRadius: '2px'}}></div>
        ))}
      </div>

      {internalIsGameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-85 text-white z-10 p-4">
          <h2 className="text-4xl font-bold font-secondary mb-4">Game Over!</h2>
          <p className="text-2xl mb-2">{winner === 'Player' ? 'You Win!' : (winner === 'AI' ? 'AI Wins!' : 'Match Ended')}</p>
          <p className="text-xl">Final Score: Player {playerScore} - AI {aiScore}</p>
        </div>
      )}
      
      {isGameActive && !internalIsGameOver && !isPaused && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-20 md:hidden">
          <button 
            onTouchStart={(e) => { e.preventDefault(); if(!isPaused) movePlayerPaddle('up'); }}
            onMouseDown={(e) => { e.preventDefault(); if(!isPaused) movePlayerPaddle('up'); }} 
            className="w-20 h-20 bg-accent/60 text-white rounded-full text-3xl font-bold active:bg-accent flex items-center justify-center shadow-lg select-none"
            aria-label="Move Paddle Up"
          >
            {/* Up Arrow Unicode Character */}
            	
          </button>
          <button 
            onTouchStart={(e) => { e.preventDefault(); if(!isPaused) movePlayerPaddle('down'); }}
            onMouseDown={(e) => { e.preventDefault(); if(!isPaused) movePlayerPaddle('down'); }} 
            className="w-20 h-20 bg-accent/60 text-white rounded-full text-3xl font-bold active:bg-accent flex items-center justify-center shadow-lg select-none"
            aria-label="Move Paddle Down"
          >
            {/* Down Arrow Unicode Character */}
            	
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

export default PixelPongGame;
