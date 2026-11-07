import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; description: string }> = {
  '/': { title: 'Overview', description: 'Network design summary and key metrics' },
  '/simulation': { title: 'Guided Simulation', description: '10-step packet walkthrough of the 43-device network' },
  '/topology': { title: 'Topology Explorer', description: 'Interactive network topology with path tracing' },
  '/device-guide': { title: 'Device Guide', description: 'All 43 devices with purpose & justification' },
  '/vlsm': { title: 'VLSM Studio', description: 'Client-side subnet allocation calculator' },
  '/architecture': { title: 'Architecture', description: 'Complete design documentation' },
};

export const Header: React.FC = () => {
  const location = useLocation();
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
          Frontend-only · Educational workspace
        </span>
        <span className="connection-status">
          <span className="status-dot connected" aria-hidden="true" />
          Local data mode
        </span>
      </div>
    </header>
  );
};