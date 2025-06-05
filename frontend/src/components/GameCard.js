import React from 'react';
import { Link } from 'react-router-dom';

/**
 * GameCard component
 * Displays a single game card with its thumbnail, title, description, and a play button.
 * @param {object} props - Component props.
 * @param {object} props.game - The game object.
 * @param {string} props.game.id - Unique identifier for the game (used for URL).
 * @param {string} props.game.name - The name/title of the game.
 * @param {string} props.game.description - A short description of the game.
 * @param {string} props.game.thumbnailUrl - URL for the game's thumbnail image.
 */
const GameCard = ({ game }) => {
  if (!game) {
    return null; // Or a placeholder/loading state
  }

  const { id, name, description, thumbnailUrl } = game;

  return (
    <div className="bg-secondary-bg rounded-lg overflow-hidden shadow-lg hover:shadow-accent/30 transition-all duration-300 ease-in-out transform hover:-translate-y-2 flex flex-col">
      {/* Game Thumbnail Area */}
      <div className="w-full h-48 bg-gray-700 overflow-hidden">
        {thumbnailUrl ? (
          <img 
            src={thumbnailUrl} 
            alt={`${name} Thumbnail`} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-medium">
            No Preview
          </div>
        )}
      </div>

      {/* Game Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-secondary text-xl font-semibold text-text-light mb-2 truncate" title={name}>
          {name}
        </h3>
        <p className="text-sm text-text-medium mb-4 flex-grow line-clamp-3">
          {description}
        </p>
        <Link 
          to={`/game/${id}`}
          className="mt-auto w-full text-center bg-accent text-white font-semibold py-2 px-4 rounded-md hover:bg-pink-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50"
        >
          Play Now
        </Link>
      </div>
    </div>
  );
};

export default GameCard;
