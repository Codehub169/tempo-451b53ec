import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access the authentication context.
 * Provides an easy way to get user data, authentication status, and auth functions.
 * @returns {object} The authentication context value (user, token, login, logout, register, isLoading, error, isAuthenticated, clearError).
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
