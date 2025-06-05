import React from 'react';
// import { APP_NAME } from '../config'; // To be implemented in a future batch

const APP_NAME = 'Arcade Haven'; // Placeholder for config.js import

/**
 * Footer component
 * Displays copyright information and application name.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary-bg text-text-medium py-6 shadow-top-md border-t border-border-color">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">
          &copy; {currentYear} {APP_NAME}. All Rights Reserved. Designed for fun.
        </p>
        {/* Optional: Add links to privacy policy, terms of service, etc. here */}
        {/* 
        <div className="mt-2">
          <a href="/privacy" className="text-xs hover:text-accent transition-colors">Privacy Policy</a>
          <span className="mx-2 text-xs">|</span>
          <a href="/terms" className="text-xs hover:text-accent transition-colors">Terms of Service</a>
        </div>
        */}
      </div>
    </footer>
  );
};

export default Footer;
