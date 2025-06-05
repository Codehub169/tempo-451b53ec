import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import GameCard from '../components/GameCard';
import { gameService } from '../services/gameService';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const gamesData = await gameService.getGamesList();
        setGames(gamesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError('Failed to load games. Please try again later.');
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGames();
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
          <div className="mt-4 w-12 h-12 border-4 border-accent border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
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
