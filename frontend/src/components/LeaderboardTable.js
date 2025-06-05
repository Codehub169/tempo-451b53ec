import React from 'react';
import PropTypes from 'prop-types';

/**
 * LeaderboardTable Component
 * Displays a table of scores for a specific game.
 *
 * Props:
 *  - scores (Array): An array of score objects. Each object should have:
 *    - id (Number | String): Unique ID for the score item (for key prop).
 *    - rank (Number | String): Optional. The player's rank. If not provided, index is used.
 *    - User (Object): Contains player information, { username: String } (from Sequelize include).
 *    - scoreValue (Number): The score achieved.
 *    - createdAt (String): ISO date string the score was achieved.
 *  - gameName (String): The name of the game for which scores are displayed.
 *  - isLoading (Boolean): Optional. If true, shows a loading state.
 */
const LeaderboardTable = ({ scores, gameName, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-secondary-bg p-6 rounded-lg shadow-lg text-center">
        <p className="text-text-light text-lg">Loading scores for {gameName ? <span className='font-semibold text-accent'>{gameName}</span> : 'the game'}...</p>
        <div className="mt-4 w-16 h-16 border-4 border-accent border-t-transparent border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="bg-secondary-bg p-6 rounded-lg shadow-lg text-center">
        <p className="text-text-light text-lg">No scores yet for <span className='font-semibold text-accent'>{gameName || 'this game'}</span>.</p>
        <p className="text-text-medium text-sm">Be the first to set a high score!</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary-bg shadow-lg rounded-lg overflow-hidden">
      <h3 className="text-2xl font-secondary text-accent p-4 text-center border-b border-border-color">
        Top Scores: {gameName || 'Leaderboard'}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-color">
          <thead className="bg-primary-bg/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-center text-xs font-medium font-secondary text-accent uppercase tracking-wider w-1/12"
              >
                Rank
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium font-secondary text-accent uppercase tracking-wider w-5/12"
              >
                Player
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium font-secondary text-accent uppercase tracking-wider w-3/12"
              >
                Score
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium font-secondary text-accent uppercase tracking-wider w-3/12"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-secondary-bg divide-y divide-border-color">
            {scores.map((scoreItem, index) => (
              <tr key={scoreItem.id || `score-${index}`} className="hover:bg-primary-bg/30 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent text-center">{scoreItem.rank || index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                  {scoreItem.User?.username || 'Anonymous'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light text-right font-semibold">
                  {typeof scoreItem.scoreValue === 'number' ? scoreItem.scoreValue.toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-medium text-right">
                  {scoreItem.createdAt ? new Date(scoreItem.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

LeaderboardTable.propTypes = {
  scores: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rank: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    User: PropTypes.shape({
      username: PropTypes.string
    }),
    scoreValue: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
  })).isRequired,
  gameName: PropTypes.string,
  isLoading: PropTypes.bool,
};

LeaderboardTable.defaultProps = {
  gameName: '',
  isLoading: false,
};

export default LeaderboardTable;
