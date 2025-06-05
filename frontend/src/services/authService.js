import axios from 'axios';
import { API_BASE_URL } from '../config'; // Assuming config.js exports API_BASE_URL

const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

const TOKEN_KEY = 'arcadeHavenToken';
const USER_KEY = 'arcadeHavenUser';

/**
 * Logs in a user.
 * @param {object} credentials - { emailOrUsername, password }
 * @returns {Promise<object>} The user data and token.
 */
const login = async (credentials) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
    if (response.data && response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

/**
 * Registers a new user.
 * @param {object} userData - { username, email, password }
 * @returns {Promise<object>} The newly created user data.
 */
const register = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Registration failed');
  }
};

/**
 * Logs out the current user.
 */
const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * Gets the current user from localStorage.
 * @returns {object|null} The user object or null if not logged in.
 */
const getCurrentUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Gets the JWT token from localStorage.
 * @returns {string|null} The token or null if not found.
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Set auth header on initial load if token exists
const initialToken = getToken();
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}


export const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
};
