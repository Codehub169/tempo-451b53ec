import React, { useState, useEffect, useCallback } from 'react';

const CARD_VALUES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const GAME_TIME_LIMIT = 120; // seconds

const generateCards = () => {
  const deck = [...CARD_VALUES, ...CARD_VALUES];
  // Shuffle algorithm (Fisher-Yates)
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

const MemoryMatchGame = ({ onScoreUpdate, onGameOver }) => {
  const [cards, setCards] = useState(generateCards());
  const [flippedCards, setFlippedCards] = useState([]);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const startGame = useCallback(() => {
    setCards(generateCards());
    setFlippedCards([]);
    setMatches(0);
    setTimeLeft(GAME_TIME_LIMIT);
    setIsGameActive(true);
    setIsGameOver(false);
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  useEffect(() => {
    if (isGameActive && !isGameOver) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Time's up
        setIsGameActive(false);
        setIsGameOver(true);
        onGameOver(matches * 10); // Score based on matches
      }
    }
  }, [isGameActive, isGameOver, timeLeft, matches, onGameOver]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstCard, secondCard] = flippedCards;
      if (cards[firstCard].value === cards[secondCard].value) {
        // Match
        setCards(prevCards =>
          prevCards.map(card =>
            card.id === cards[firstCard].id || card.id === cards[secondCard].id
              ? { ...card, isMatched: true, isFlipped: true }
              : card
          )
        );
        setMatches(prevMatches => {
          const newMatches = prevMatches + 1;
          onScoreUpdate(newMatches * 10);
          return newMatches;
        });
        setFlippedCards([]);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === cards[firstCard].id || card.id === cards[secondCard].id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, onScoreUpdate]);

  useEffect(() => {
    if (isGameActive && matches === CARD_VALUES.length) {
      // All pairs matched
      setIsGameActive(false);
      setIsGameOver(true);
      const score = (matches * 10) + timeLeft; // Bonus for time left
      onGameOver(score);
    }
  }, [matches, isGameActive, timeLeft, onGameOver]);

  const handleCardClick = (index) => {
    if (!isGameActive || isGameOver || cards[index].isFlipped || flippedCards.length === 2) {
      return;
    }

    setCards(prevCards =>
      prevCards.map(card =>
        card.id === index ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards(prevFlipped => [...prevFlipped, index]);
  };

  if (!isGameActive && !isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-800 p-4 rounded-lg">
        <h2 className="text-3xl font-bold text-accent mb-6">Memory Match</h2>
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
    <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg h-full">
      <div className="w-full flex justify-between items-center mb-4">
        <p className="text-xl text-text-light">Matches: <span className='font-bold text-accent'>{matches}</span>/{CARD_VALUES.length}</p>
        <p className="text-xl text-text-light">Time Left: <span className='font-bold text-accent'>{timeLeft}s</span></p>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-md flex-grow">
        {cards.map((card, index) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`aspect-square rounded-lg flex items-center justify-center text-2xl sm:text-4xl font-bold cursor-pointer transition-all duration-300 transform
              ${card.isFlipped || card.isMatched ? 'bg-accent text-white rotate-y-180' : 'bg-secondary-bg hover:bg-gray-600'}
              ${card.isMatched ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {(card.isFlipped || card.isMatched) ? card.value : '?'}
          </div>
        ))}
      </div>
      {isGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center rounded-lg">
          <h3 className="text-3xl font-bold text-white mb-4">
            {matches === CARD_VALUES.length ? 'You Won!' : 'Time\'s Up!'}
          </h3>
          <p className="text-xl text-white mb-6">Final Score: {matches * 10 + (matches === CARD_VALUES.length ? timeLeft : 0)}</p>
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

export default MemoryMatchGame;
