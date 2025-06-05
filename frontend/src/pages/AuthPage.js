import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user, isLoading: authLoading, error: authError, clearError } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Sync local serverError state with authError from context
  useEffect(() => {
    if (authError) {
      setServerError(authError);
    } else {
      // If authError is cleared in the context, clear the local serverError as well.
      setServerError(null);
    }
  }, [authError]);

  const handleLogin = async (credentials) => {
    setIsSubmitting(true);
    clearError(); // Clear previous context errors
    setServerError(null); // Clear local error display immediately
    try {
      // The 'credentials' object from AuthForm already has { emailOrUsername, password }
      await login(credentials);
      // Navigation upon successful login is handled by the useEffect watching the 'user' state
      // or potentially by the AuthContext itself if it has navigation logic.
    } catch (error) {
      // Error should be set in AuthContext and propagated via the 'authError' useEffect.
      // If specific local handling is needed, uncomment and customize:
      // setServerError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (formData) => {
    setIsSubmitting(true);
    clearError(); // Clear previous context errors
    setServerError(null); // Clear local error display immediately
    try {
      await register({ username: formData.username, email: formData.email, password: formData.password });
      // After successful registration, inform the user.
      // A more sophisticated approach might involve a toast notification or 
      // automatically switching AuthForm to login mode with a success message.
      alert('Registration successful! Please login.'); 
      // Consider navigating to /auth?mode=login or letting AuthForm handle mode switch
      // navigate('/auth?mode=login', { replace: true });
    } catch (error) {
      // Error should be set in AuthContext and propagated via the 'authError' useEffect.
      // If specific local handling is needed, uncomment and customize:
      // setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <AuthForm 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            initialMode={initialMode} 
            isLoading={isSubmitting || authLoading}
            serverError={serverError} // This error comes from AuthContext via local state
          />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
