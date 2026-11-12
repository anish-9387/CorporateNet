import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const location = useLocation();
  return (
    <div className="app-shell min-h-screen flex">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Sidebar />
      <div className="workspace flex-1 min-w-0">
        <Header />
        <main id="main-content" className="workspace-content" tabIndex={-1}>
          <div key={location.pathname} className="page-enter"><Outlet /></div>
        </main>
      </div>
    </div>
  );
};
