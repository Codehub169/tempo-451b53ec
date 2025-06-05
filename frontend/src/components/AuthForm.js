import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

/**
 * AuthForm Component
 * Provides UI for user login and registration.
 *
 * Props:
 *  - onLogin (Function): Callback function invoked on successful login. Receives user data.
 *  - onRegister (Function): Callback function invoked on successful registration. Receives user data.
 *  - initialMode (String): 'login' or 'signup'. Defaults to 'login'.
 *  - isLoading (Boolean): If true, disables form and shows loading state on buttons.
 *  - serverError (String): An error message from the server to display.
 */
const AuthForm = ({ onLogin, onRegister, initialMode = 'login', isLoading = false, serverError = null }) => {
  const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(''); // Clear local form error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(''); // Clear previous local errors

    if (isLoginMode) {
      if (!formData.email || !formData.password) {
        setFormError('Email and Password are required.');
        return;
      }
      // In a real app, onLogin would be an async function making an API call
      // For now, it's a prop passed down
      if (onLogin) onLogin({ emailOrUsername: formData.email, password: formData.password });
    } else {
      if (!formData.username || !formData.email || !formData.password) {
        setFormError('Username, Email, and Password are required.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
      if (onRegister) onRegister({ username: formData.username, email: formData.email, password: formData.password });
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormError('');
    setFormData({ username: '', email: '', password: '', confirmPassword: '' }); // Reset form fields
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-secondary-bg rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center font-secondary text-accent">
        {isLoginMode ? 'Welcome Back!' : 'Create Account'}
      </h2>
      
      {(formError || serverError) && (
        <div className="p-3 text-sm text-white bg-error rounded-md text-center">
          {formError || serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLoginMode && (
          <Input
            label="Username"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Choose a cool username"
            disabled={isLoading}
            required
          />
        )}
        <Input
          label={isLoginMode ? "Email or Username" : "Email"}
          type="text" // Keep as text for emailOrUsername, use 'email' type for signup if strict validation needed
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder={isLoginMode ? "your.email@example.com or Username" : "your.email@example.com"}
          disabled={isLoading}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="••••••••"
          disabled={isLoading}
          required
        />
        {!isLoginMode && (
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="••••••••"
            disabled={isLoading}
            required
          />
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
          {isLoading ? (isLoginMode ? 'Logging in...' : 'Signing up...') : (isLoginMode ? 'Login' : 'Sign Up')}
        </Button>
      </form>
      <p className="text-sm text-center text-text-medium">
        {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{
          ' '
        }
        <button
          onClick={toggleMode}
          className="font-medium text-accent hover:underline focus:outline-none"
          disabled={isLoading}
        >
          {isLoginMode ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default AuthForm;
