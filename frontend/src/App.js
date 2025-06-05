import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout'; // Still needed for loadingFallback
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AuthPage from './pages/AuthPage';
// import ProfilePage from './pages/ProfilePage'; // Example: If you add a ProfilePage
import { useAuth } from './contexts/AuthContext';

// Fallback for lazy loading, uses Layout to maintain structure
const loadingFallback = <Layout><div className='text-center p-10 text-xl text-text-medium'>Loading page...</div></Layout>;

// ProtectedRoute component: wraps routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation(); // Hook to get current location object

  if (!isAuthenticated) {
    // If user is not authenticated, redirect to /auth page.
    // 'state={{ from: location }}' passes the current location to the AuthPage,
    // so after login, the user can be redirected back to the page they were trying to access.
    // 'replace' prop avoids adding the /auth route to history when redirecting from a protected route.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, render the child components (the protected page)
  return children;
};

function App() {
  // The main application component that sets up routing.
  // Pages (HomePage, GamePage, LeaderboardPage, AuthPage) are expected to include
  // their own <Layout> component if they need the standard header/footer.
  // This was a change from a previous version where App.js wrapped each route in <Layout>.
  return (
    <Suspense fallback={loadingFallback}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
        <Route path="/leaderboards" element={<LeaderboardPage />} />
        
        {/* Example of a protected route for a profile page. */}
        {/* Assuming ProfilePage exists and includes its own Layout if needed. */}
        {/* 
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        /> 
        */}

        {/* Fallback route: if no other route matches, navigate to the home page. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
