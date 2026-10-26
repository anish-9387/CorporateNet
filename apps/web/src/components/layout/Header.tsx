import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
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
  const [connected, setConnected] = useState<boolean | null>(null);
  useEffect(() => {
    api.get('/health').then(() => setConnected(true)).catch(() => setConnected(false));
  }, [location.pathname]);
  const pageInfo = pageTitles[location.pathname] ?? { title: 'CorporateNet', description: '' };

  return (
    <header className="workspace-header sticky top-0 z-30 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{pageInfo.title}</h1>
          {pageInfo.description && (
            <p className="text-sm text-slate-500 mt-0.5">{pageInfo.description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500 hidden sm:block">
          Educational workspace
        </span>
        <span role="status" className="connection-status">
          <span className={`status-dot ${connected ? 'connected' : ''}`} aria-hidden="true" />
          {connected === null ? 'Connecting' : connected ? 'API online' : 'API offline'}
        </span>
      </div>
    </header>
  );
};
