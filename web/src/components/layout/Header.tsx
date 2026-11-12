import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, { title: string; description: string }> = {
  '/': { title: 'Scalable Corporate Network', description: 'A connected workplace, explained simply' },
  '/simulation': { title: 'Packet simulation', description: 'Follow the packet, one step at a time' },
  '/topology': { title: 'Network topology', description: 'Explore connections and illustrated packet paths' },
  '/device-guide': { title: 'Devices & roles', description: 'What each device does and why it is here' },
  '/vlsm': { title: 'IP addressing', description: 'Divide the network to fit each department' },
  '/architecture': { title: 'Architecture', description: 'Network layers, topology and room to grow' },
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
          VLSM · OSPF · DHCP · NAT
        </span>
        <span className="connection-status">
          <span className="status-dot connected" aria-hidden="true" />
          Project walkthrough
        </span>
      </div>
    </header>
  );
};
