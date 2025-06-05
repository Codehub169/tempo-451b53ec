import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AuthPage from './pages/AuthPage';
import { useAuth } from './contexts/AuthContext';

// Fallback for lazy loading
const loadingFallback = <Layout><div className='text-center p-10 text-xl'>Loading page...</div></Layout>;

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to when they were redirected.
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <Suspense fallback={loadingFallback}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/game/:gameId" element={<Layout><GamePage /></Layout>} /> 
        {/* Example of a protected route, if needed for specific game pages or profile */}
        {/* <Route path="/game/:gameId" element={<ProtectedRoute><Layout><GamePage /></Layout></ProtectedRoute>} /> */}
        <Route path="/leaderboards" element={<Layout><LeaderboardPage /></Layout>} />
        {/* Add other routes here, e.g., Profile Page */}
        {/* <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
