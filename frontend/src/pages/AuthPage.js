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

  useEffect(() => {
    if (authError) {
      setServerError(authError);
    }
  }, [authError]);

  const handleLogin = async (formData) => {
    setIsSubmitting(true);
    clearError(); // Clear previous context errors
    setServerError(null);
    try {
      await login({ emailOrUsername: formData.email, password: formData.password });
      // Navigation will be handled by the useEffect watching the user state or by AuthContext itself
    } catch (error) {
      // Error is already set in AuthContext, or use local if needed
      // setServerError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (formData) => {
    setIsSubmitting(true);
    clearError(); // Clear previous context errors
    setServerError(null);
    try {
      await register({ username: formData.username, email: formData.email, password: formData.password });
      // After successful registration, you might want to navigate to login or show a success message.
      // For now, AuthForm can switch to login mode or show a message.
      alert('Registration successful! Please login.'); 
      // Consider navigating to /auth?mode=login or AuthForm handles mode switch
    } catch (error) {
      // Error is already set in AuthContext, or use local if needed
      // setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';

  return (
    <Layout>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <AuthForm 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            initialMode={initialMode} 
            isLoading={isSubmitting || authLoading}
            serverError={serverError}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
