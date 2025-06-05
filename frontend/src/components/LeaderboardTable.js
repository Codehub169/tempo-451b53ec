import React from 'react';

/**
 * LeaderboardTable Component
 * Displays a table of scores for a specific game.
 *
 * Props:
 *  - scores (Array): An array of score objects. Each object should have:
 *    - rank (Number | String): The player's rank.
 *    - player (Object): Contains player information, typically { username: String }.
 *    - scoreValue (Number | String): The score achieved.
 *    - date (String): The date the score was achieved (e.g., 'YYYY-MM-DD').
 *  - gameName (String): The name of the game for which scores are displayed.
 *  - isLoading (Boolean): Optional. If true, shows a loading state.
 */
const LeaderboardTable = ({ scores, gameName, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-secondary-bg p-6 rounded-lg shadow-lg text-center">
        <p className="text-text-light text-lg">Loading scores for {gameName}...</p>
        <div className="mt-4 w-16 h-16 border-4 border-accent border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="bg-secondary-bg p-6 rounded-lg shadow-lg text-center">
        <p className="text-text-light text-lg">No scores yet for <span className='font-semibold text-accent'>{gameName}</span>.</p>
        <p className="text-text-medium text-sm">Be the first to set a high score!</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary-bg shadow-lg rounded-lg overflow-hidden">
      <h3 className="text-2xl font-secondary text-accent p-4 text-center border-b border-border-color">
        Top Scores: {gameName}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-color">
          <thead className="bg-primary-bg/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium font-secondary text-accent uppercase tracking-wider"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium font-secondary text-accent uppercase tracking-wider"
              >
                Player
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium font-secondary text-accent uppercase tracking-wider"
              >
                Score
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium font-secondary text-accent uppercase tracking-wider"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary-bg divide-y divide-border-color">
            {scores.map((scoreItem, index) => (
              <tr key={scoreItem.id || index} className="hover:bg-primary-bg/30 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent text-center w-1/12">{scoreItem.rank || index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light w-5/12">
                  {scoreItem.player?.username || 'Anonymous'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light text-right font-semibold w-3/12">
                  {scoreItem.scoreValue?.toLocaleString() || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-medium text-right w-3/12">
                  {scoreItem.date ? new Date(scoreItem.date).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
