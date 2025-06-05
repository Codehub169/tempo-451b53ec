import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth'; // To be implemented in a future batch
// import { APP_NAME } from '../config'; // To be implemented in a future batch

const APP_NAME = 'Arcade Haven'; // Placeholder for config.js import

/**
 * Header component
 * Displays the application logo/name and navigation links.
 * Includes responsive design for mobile navigation.
 */
const Header = () => {
  // const { user, logout } = useAuth(); // Placeholder for AuthContext integration
  const user = null; // Mock user state, replace with useAuth().user
  const logout = () => console.log('Logout clicked'); // Mock logout function

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClasses = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out 
     ${isActive ? 'bg-accent text-white' : 'text-text-medium hover:text-text-light hover:bg-gray-700'}`;
  
  const mobileNavLinkClasses = ({ isActive }) => 
    `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out 
     ${isActive ? 'bg-accent text-white' : 'text-text-medium hover:text-text-light hover:bg-gray-700'}`;

  return (
    <header className="bg-secondary-bg shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-secondary font-extrabold">
              <span className="text-accent">{APP_NAME.split(' ')[0]}</span>
              <span className="text-text-light">{APP_NAME.split(' ').slice(1).join(' ')}</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <NavLink to="/" className={navLinkClasses} end>Games</NavLink>
              <NavLink to="/leaderboards" className={navLinkClasses}>Leaderboards</NavLink>
              {user ? (
                <>
                  <span className="text-text-medium text-sm">Hi, {user.username}!</span>
                  <button 
                    onClick={logout} 
                    className="px-3 py-2 rounded-md text-sm font-medium text-text-medium hover:text-text-light hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/auth" className={navLinkClasses}>Login/Sign Up</NavLink>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-text-medium hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu open/close */}
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu (shown when isMobileMenuOpen is true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink to="/" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)} end>Games</NavLink>
            <NavLink to="/leaderboards" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Leaderboards</NavLink>
            {user ? (
              <>
                <span className="block px-3 py-2 text-base font-medium text-text-medium">Hi, {user.username}!</span>
                <button 
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-text-medium hover:text-text-light hover:bg-gray-700 transition-colors duration-150 ease-in-out"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/auth" className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>Login/Sign Up</NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
