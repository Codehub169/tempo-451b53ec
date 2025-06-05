import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout component
 * Provides the basic structure for all pages in the application.
 * It includes a Header, a main content area, and a Footer.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The content to be rendered within the main layout area.
 */
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-primary-bg text-text-light font-primary">
      {/* Header component fixed at the top */}
      <Header />
      {/* Main content area that grows to fill available space */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      {/* Footer component at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;
