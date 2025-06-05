import axios from 'axios';
import { API_BASE_URL } from '../config'; // Assuming config.js exports API_BASE_URL

const SCORE_API_URL = `${API_BASE_URL}/api/scores`;

/**
 * Submits a score for a game.
 * Requires authentication (token).
 * @param {string} gameName - The name of the game.
 * @param {number} scoreValue - The score achieved.
 * @returns {Promise<object>} The created score data.
 */
const submitScore = async (gameName, scoreValue) => {
  try {
    // Token should be set in axios defaults by authService or AuthContext
    const response = await axios.post(SCORE_API_URL, { gameName, scoreValue });
    return response.data;
  } catch (error) {
    console.error('Failed to submit score:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to submit score');
  }
};

/**
 * Gets the leaderboard for a specific game.
 * @param {string} gameName - The name of the game.
 * @param {number} [limit=10] - The maximum number of scores to retrieve.
 * @returns {Promise<Array<object>>} An array of score objects.
 */
const getLeaderboard = async (gameName, limit = 10) => {
  try {
    const response = await axios.get(`${SCORE_API_URL}/${gameName}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get leaderboard for ${gameName}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to get leaderboard for ${gameName}`);
  }
};

/**
 * Gets all scores for a specific user.
 * Requires authentication (token).
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array<object>>} An array of the user's score objects.
 */
const getUserScores = async (userId) => {
  try {
    // Token should be set in axios defaults
    const response = await axios.get(`${SCORE_API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get scores for user ${userId}:`, error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error(`Failed to get scores for user ${userId}`);
  }
};

export const scoreService = {
  submitScore,
  getLeaderboard,
  getUserScores,
};
