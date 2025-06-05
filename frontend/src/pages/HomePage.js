import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
// import { getGames } from '../services/gameService'; // Placeholder for API call

const mockGames = [
  {
    id: 'cosmicrush',
    name: 'Cosmic Rush',
    description: 'Navigate your ship through an asteroid field. How long can you survive?',
    thumbnailUrl: 'https://picsum.photos/seed/cosmicrush/400/300'
  },
  {
    id: 'blockstacker',
    name: 'Block Stacker',
    description: 'Stack blocks perfectly to build the tallest tower. Precision is key!',
    thumbnailUrl: 'https://picsum.photos/seed/blockstacker/400/300'
  },
  {
    id: 'pixelpong',
    name: 'Pixel Pong',
    description: 'A modern twist on a classic. Challenge the AI or a friend!',
    thumbnailUrl: 'https://picsum.photos/seed/pixelpong/400/300'
  },
  {
    id: 'memorymatch',
    name: 'Memory Match',
    description: 'Test your memory by matching pairs of cards against the clock.',
    thumbnailUrl: 'https://picsum.photos/seed/memorymatch/400/300'
  },
  {
    id: 'speedclicker',
    name: 'Speed Clicker',
    description: 'How many times can you click the target in 10 seconds? Test your reflexes!',
    thumbnailUrl: 'https://picsum.photos/seed/speedclicker/400/300'
  },
  {
    id: 'mazerunnerx',
    name: 'Maze Runner X',
    description: 'Navigate complex mazes. Find the exit before time runs out!',
    thumbnailUrl: 'https://picsum.photos/seed/mazerunner/400/300'
  }
];

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch games from an API:
    // getGames()
    //   .then(data => {
    //     setGames(data);
    //     setIsLoading(false);
    //   })
    //   .catch(err => {
    //     console.error("Error fetching games:", err);
    //     setError('Failed to load games. Please try again later.');
    //     setIsLoading(false);
    //   });
    
    // Using mock data for now
    setTimeout(() => { // Simulate API delay
      setGames(mockGames);
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <Layout>
      <section className="text-center py-12 md:py-16">
        <h1 className="font-secondary text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
          Welcome to <span className="text-accent">Arcade Haven</span>
        </h1>
        <p className="text-lg sm:text-xl text-text-medium max-w-2xl mx-auto">
          Discover unique and fun browser games, compete for high scores, and enjoy a sleek dark theme experience.
        </p>
      </section>

      {isLoading && (
        <div className="text-center py-10">
          <p className="text-xl text-text-medium">Loading awesome games...</p>
          {/* You can add a spinner component here */}
        </div>
      )}

      {error && (
        <div className="text-center py-10 bg-error/10 text-error p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && games.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-12">
          {games.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </section>
      )}

      {!isLoading && !error && games.length === 0 && (
         <div className="text-center py-10">
          <p className="text-xl text-text-medium">No games available at the moment. Check back soon!</p>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;
