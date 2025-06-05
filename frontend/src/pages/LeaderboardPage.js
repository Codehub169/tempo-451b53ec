import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LeaderboardTable from '../components/LeaderboardTable';
import Button from '../components/ui/Button'; // Using Button for tabs
// import { getLeaderboard } from '../services/scoreService'; // Placeholder for API
// import { getGamesList } from '../services/gameService'; // Placeholder for API

// Mock data - replace with API calls
const mockGameList = [
  { id: 'cosmicrush', name: 'Cosmic Rush' },
  { id: 'blockstacker', name: 'Block Stacker' },
  { id: 'pixelpong', name: 'Pixel Pong' },
  { id: 'memorymatch', name: 'Memory Match' },
  { id: 'speedclicker', name: 'Speed Clicker' },
  { id: 'mazerunnerx', name: 'Maze Runner X' },
];

const mockLeaderboards = {
  cosmicrush: [
    { id: 's1', rank: 1, player: { username: 'GalaxyGamer' }, scoreValue: 15230, date: '2024-07-20' },
    { id: 's2', rank: 2, player: { username: 'StarSeeker' }, scoreValue: 12800, date: '2024-07-19' },
  ],
  blockstacker: [
    { id: 's3', rank: 1, player: { username: 'TowerTitan' }, scoreValue: 255, date: '2024-07-21' },
  ],
  // Add more mock scores for other games if needed
};

const LeaderboardPage = () => {
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [scores, setScores] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch list of games for tabs
    // getGamesList().then(setGames).catch(err => setError('Failed to load game list.'));
    setGames(mockGameList);
    setIsLoadingGames(false);
    if (mockGameList.length > 0) {
      //setSelectedGameId(mockGameList[0].id); // Select first game by default
    }
  }, []);

  useEffect(() => {
    if (selectedGameId) {
      setIsLoadingScores(true);
      setError(null);
      // Fetch leaderboard for selectedGameId
      // getLeaderboard(selectedGameId)
      //   .then(data => {
      //     setScores(data);
      //     setIsLoadingScores(false);
      //   })
      //   .catch(err => {
      //     console.error(`Error fetching leaderboard for ${selectedGameId}:`, err);
      //     setError(`Failed to load scores for ${games.find(g => g.id === selectedGameId)?.name}.`);
      //     setScores([]);
      //     setIsLoadingScores(false);
      //   });
      setTimeout(() => { // Simulate API delay
        setScores(mockLeaderboards[selectedGameId] || []);
        setIsLoadingScores(false);
      }, 300);
    }
     else {
      setScores([]); // Clear scores if no game is selected
    }
  }, [selectedGameId, games]);

  const selectedGame = games.find(g => g.id === selectedGameId);

  return (
    <Layout>
      <section className="py-8">
        <h1 className="font-secondary text-3xl sm:text-4xl text-center mb-8">
          Top Player <span className="text-accent">Leaderboards</span>
        </h1>

        {isLoadingGames ? (
          <div className="text-center text-text-medium">Loading game list...</div>
        ) : games.length === 0 && !error ? (
          <div className="text-center text-text-medium">No games available to display leaderboards.</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2 mb-8 px-2">
            {games.map(game => (
              <Button
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                variant={selectedGameId === game.id ? 'primary' : 'secondary'}
                className={`px-4 py-2 text-sm sm:text-base ${selectedGameId !== game.id ? '!bg-secondary-bg hover:!bg-border-color focus:!ring-accent/50' : ''}`}
              >
                {game.name}
              </Button>
            ))}
          </div>
        )}
        
        {error && <div className="text-center text-error bg-error/10 p-3 rounded-md mb-6">{error}</div>}

        {selectedGameId ? (
          <LeaderboardTable 
            scores={scores} 
            gameName={selectedGame?.name || 'Selected Game'} 
            isLoading={isLoadingScores} 
          />
        ) : (
          !isLoadingGames && games.length > 0 && (
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
