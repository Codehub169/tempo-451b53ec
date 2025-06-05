import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import LeaderboardTable from '../components/LeaderboardTable';
import Button from '../components/ui/Button';
import { scoreService } from '../services/scoreService';
import { gameService } from '../services/gameService';

const LeaderboardPage = () => {
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [scores, setScores] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGamesList = async () => {
      setIsLoadingGames(true);
      setError(null);
      try {
        const gamesData = await gameService.getGamesList();
        setGames(gamesData);
        // Optionally select the first game by default:
        // if (gamesData && gamesData.length > 0) {
        //   setSelectedGameId(gamesData[0].id);
        // }
      } catch (err) {
        console.error('Failed to load game list:', err);
        setError('Failed to load game list. Please try again later.');
        setGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    };
    fetchGamesList();
  }, []);

  const fetchLeaderboardForGame = useCallback(async (gameIdForLeaderboard) => {
    if (!gameIdForLeaderboard) {
      setScores([]);
      return;
    }
    setIsLoadingScores(true);
    setError(null); 
    try {
      const game = games.find(g => g.id === gameIdForLeaderboard);
      if (!game || !game.name) {
        throw new Error(`Game details not found for ID: ${gameIdForLeaderboard}. Unable to fetch leaderboard.`);
      }
      const data = await scoreService.getLeaderboard(game.name);
      setScores(data);
    } catch (err) {
      console.error(`Error fetching leaderboard for game ID ${gameIdForLeaderboard}:`, err);
      const gameNameDisplay = games.find(g => g.id === gameIdForLeaderboard)?.name || gameIdForLeaderboard;
      setError(`Failed to load scores for ${gameNameDisplay}. Please try again.`);
      setScores([]);
    } finally {
      setIsLoadingScores(false);
    }
  }, [games, scoreService]);

  useEffect(() => {
    if (selectedGameId) {
      fetchLeaderboardForGame(selectedGameId);
    }
     else {
      setScores([]); 
      setError(null); 
    }
  }, [selectedGameId, fetchLeaderboardForGame]);

  const selectedGameDetails = games.find(g => g.id === selectedGameId);

  return (
    <Layout>
      <section className="py-8 px-4">
        <h1 className="font-secondary text-3xl sm:text-4xl text-center mb-8">
          Top Player <span className="text-accent">Leaderboards</span>
        </h1>

        {isLoadingGames ? (
          <div className="text-center text-text-medium py-4">Loading game list...</div>
        ) : games.length === 0 && !error ? (
          <div className="text-center text-text-medium py-4">No games available to display leaderboards.</div>
        ) : games.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-2 mb-8 px-2">
            {games.map(game => (
              <Button
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                variant={selectedGameId === game.id ? 'primary' : 'secondary'}
                className={`px-4 py-2 text-sm sm:text-base transition-colors duration-150 ease-in-out ${selectedGameId !== game.id ? '!bg-secondary-bg text-text-medium hover:!bg-border-color hover:text-text-light focus:!ring-accent/50' : 'text-white'}`}
              >
                {game.name}
              </Button>
            ))}
          </div>
        ) : null}
        
        {error && (
            <div className="text-center text-error bg-error/10 p-3 rounded-md mb-6 max-w-xl mx-auto">
                {error}
            </div>
        )}

        {selectedGameId && !isLoadingScores && !error ? (
          <LeaderboardTable 
            scores={scores} 
            gameName={selectedGameDetails?.name || 'Selected Game'} 
            isLoading={false} // isLoadingScores is false here
          />
        ) : selectedGameId && isLoadingScores ? (
           <LeaderboardTable 
            scores={[]} 
            gameName={selectedGameDetails?.name || 'Selected Game'} 
            isLoading={true} 
          />
        ) : (
          !isLoadingGames && games.length > 0 && !error && (
            <div className="text-center text-text-medium py-10 text-xl">
              Please select a game to view its leaderboard.
            </div>
          )
        )}
      </section>
    </Layout>
  );
};

export default LeaderboardPage;
