import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-w-0">
        <Header />
        <main className="p-6" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};