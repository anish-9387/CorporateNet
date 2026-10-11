import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; description: string }> = {
  '/': { title: 'Overview', description: 'Network design summary and key metrics' },
  '/topology': { title: 'Topology Explorer', description: 'Interactive network topology visualization' },
  '/vlsm': { title: 'VLSM Studio', description: 'Calculate and visualize subnet allocations' },
  '/routing': { title: 'Routing Lab', description: 'OSPF routes, neighbors, and evidence' },
  '/diagnostics': { title: 'Diagnostics', description: 'Connectivity tests and validation evidence' },
  '/scenarios': { title: 'Failure Scenarios', description: 'Link failure simulations and analysis' },
  '/reports': { title: 'Reports', description: 'Export design documentation and test results' },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] ?? { title: 'CorporateNet', description: '' };

  return (
    <header className="sticky top-0 z-30 h-[var(--header-height)] bg-white border-b border-slate-200 flex items-center px-6">
      <div className="w-[var(--sidebar-width)]" aria-hidden="true" />
      <div className="flex-1 max-w-7xl mx-auto">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{pageInfo.title}</h1>
          {pageInfo.description && (
            <p className="text-sm text-slate-500 mt-0.5">{pageInfo.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500 hidden sm:block">
          Demo Mode
        </span>
        <span className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
          Live
        </span>
      </div>
    </header>
  );
};