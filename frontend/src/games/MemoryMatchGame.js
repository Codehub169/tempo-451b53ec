import React, { useState, useEffect, useCallback } from 'react';

// Using emojis for card symbols as per review comment
const CARD_SYMBOLS = ['🍒', '🍋', '🍉', '🍓', '🍇', '🍑', '🍊', '🍏']; 
const GAME_TIME_LIMIT = 120; // seconds

const generateCards = () => {
  const deck = [...CARD_SYMBOLS, ...CARD_SYMBOLS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.map((value, index) => ({
    id: index,
    value,
    isFlipped: false,
    isMatched: false,
  }));
};

const MemoryMatchGame = ({ onScoreUpdate, onGameOver, isRunning, isPaused, onReady }) => {
  const [cards, setCards] = useState(generateCards());
  const [flippedCards, setFlippedCards] = useState([]); // Stores IDs of flipped cards
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [isGameActive, setIsGameActive] = useState(false);
  const [internalIsGameOver, setInternalIsGameOver] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    if(onReady) onReady();
  }, [onReady]);

  const startGame = useCallback(() => {
    setCards(generateCards());
    setFlippedCards([]);
    setMatches(0);
    setCurrentScore(0);
    setTimeLeft(GAME_TIME_LIMIT);
    setIsGameActive(true);
    setInternalIsGameOver(false);
    if (onScoreUpdate) onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    if (isRunning && (!isGameActive || internalIsGameOver)) {
      startGame();
    }
  }, [isRunning, isGameActive, internalIsGameOver, startGame]);


  useEffect(() => {
    let timer;
    if (isGameActive && !internalIsGameOver && !isPaused) {
      if (timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(prevTime => prevTime - 1), 1000);
      } else {
        setIsGameActive(false);
        setInternalIsGameOver(true);
        if (onGameOver) onGameOver(currentScore);
      }
    }
    return () => clearTimeout(timer);
  }, [isGameActive, internalIsGameOver, isPaused, timeLeft, currentScore, onGameOver]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCardId, secondCardId] = flippedCards;
      // Find cards by ID from the `cards` state array
      const card1 = cards.find(c => c.id === firstCardId);
      const card2 = cards.find(c => c.id === secondCardId);

      if (card1 && card2 && card1.value === card2.value) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === firstCardId || card.id === secondCardId
              ? { ...card, isMatched: true, isFlipped: true } // Keep them flipped
              : card
          )
        );
        const newMatches = matches + 1;
        setMatches(newMatches);
        const newScore = newMatches * 10;
        setCurrentScore(newScore);
        if (onScoreUpdate) onScoreUpdate(newScore);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isFlipped: false } // Flip back
                : card
            )
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  }, [flippedCards, cards, matches, onScoreUpdate]); // `cards` and `matches` are dependencies

  useEffect(() => {
    if (isGameActive && !internalIsGameOver && matches === CARD_SYMBOLS.length) {
      setIsGameActive(false);
      setInternalIsGameOver(true);
      const finalScore = currentScore + timeLeft; // Bonus for time left
      setCurrentScore(finalScore); // Update local score state as well
      if (onGameOver) onGameOver(finalScore);
    }
  }, [matches, isGameActive, internalIsGameOver, timeLeft, onGameOver, currentScore]);

  const handleCardClick = (cardId) => {
    if (!isGameActive || internalIsGameOver || isPaused || flippedCards.length === 2) return;
    
    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards(prevFlipped => [...prevFlipped, cardId]);
  };

  if (!isGameActive && !internalIsGameOver && !isRunning) {
    return (
      <div className="flex items-center justify-center w-full h-full text-text-medium">
        Press Start (on GamePage) to Play
      </div>
    );
  }
   if (!isGameActive && !internalIsGameOver && isRunning && !cards.some(c => c.isFlipped)) { 
     return (
      <div className="flex flex-col items-center justify-center h-full bg-primary-bg p-4 rounded-lg">
        <h2 className="text-3xl font-bold text-accent mb-6 font-secondary">Memory Match</h2>
         <p className="text-text-medium text-center">Match all pairs of fruits!</p>
         <p className="text-text-light text-sm mt-2">Game is ready. It will start automatically.</p>
      </div>
    );
   }


  return (
    <div className="flex flex-col items-center p-2 sm:p-4 bg-primary-bg rounded-lg h-full w-full select-none">
      <div className="w-full flex justify-between items-center mb-2 sm:mb-4 px-2">
        <p className="text-sm sm:text-lg text-text-light">Score: <span className='font-bold text-accent'>{currentScore}</span></p>
        <p className="text-sm sm:text-lg text-text-light">Time: <span className='font-bold text-accent'>{timeLeft}s</span></p>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm flex-grow">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square rounded-lg flex items-center justify-center text-2xl sm:text-4xl font-bold cursor-pointer transition-all duration-300 preserve-3d shadow-md
              ${card.isFlipped || card.isMatched ? 'bg-teal-500 text-white rotate-y-180' : 'bg-blue-700 hover:bg-blue-600'}
              ${card.isMatched ? 'opacity-60 cursor-not-allowed' : ''}
            `}
            style={{ perspective: '1000px'}}
            role="button"
            aria-pressed={card.isFlipped}
            aria-label={`Card ${card.isFlipped || card.isMatched ? card.value : 'hidden'}`}
          >
            <div style={{ transform: (card.isFlipped || card.isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.5s', backfaceVisibility: 'hidden' }}>
                {(card.isFlipped || card.isMatched) ? card.value : <span className="text-blue-300">?</span>}
            </div>
          </div>
        ))}
      </div>
      {internalIsGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg p-4 z-30">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            {matches === CARD_SYMBOLS.length ? 'You Won!' : 'Time\'s Up!'}
          </h3>
          <p className="text-lg sm:text-xl text-white mb-6">Final Score: {currentScore}</p>
        </div>
      )}
      {isPaused && isGameActive && !internalIsGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center rounded-lg p-4 z-40">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">Paused</h3>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;
