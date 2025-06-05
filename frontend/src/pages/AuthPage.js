import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is set up

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth(); // Use login and register from context
  
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      // In a real app, login function from AuthContext would handle API call
      // await login(formData.emailOrUsername, formData.password);
      console.log('Login attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // Mock success for now, AuthContext would update user and redirect
      // For demonstration, assuming login function in context handles navigation on success
      // If not, navigate('/'); or to location.state?.from?.pathname
      // This page will redirect based on user state change from context
      alert('Mock login successful! Context would typically redirect.');
      // Simulating what context might do for redirect after successful login:
      // navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      setServerError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      // In a real app, register function from AuthContext would handle API call
      // await register(formData.username, formData.email, formData.password);
      console.log('Register attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      // Mock success for now, AuthContext would update state
      // Typically, after successful registration, you might auto-login or prompt user to login.
      alert('Mock registration successful! Please login.');
      // Could switch form to login mode here or AuthForm could handle it
    } catch (error) {
      console.error('Registration failed:', error);
      setServerError(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Determine initial mode from URL query param e.g. /auth?mode=signup
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') === 'signup' ? 'signup' : 'login';

  return (
    <Layout>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo or App Name can go here if desired */}
          <AuthForm 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            initialMode={initialMode} 
            isLoading={isLoading} 
            serverError={serverError}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
