import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navigation = [
  { path: '/', label: 'Overview', icon: HomeIcon },
  { path: '/simulation', label: 'Guided Simulation', icon: TopologyIcon },
  { path: '/topology', label: 'Topology Explorer', icon: TopologyIcon },
  { path: '/device-guide', label: 'Device Guide', icon: DeviceIcon },
  { path: '/vlsm', label: 'VLSM Studio', icon: VLSMIcon },
  { path: '/architecture', label: 'Architecture', icon: ArchitectureIcon },
] as const;

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function TopologyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function DeviceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function VLSMIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ArchitectureIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="sidebar fixed inset-y-0 left-0 z-40 flex flex-col" aria-label="Main navigation">
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">C<span>n</span></span>
        <div>
          <span className="font-semibold text-lg text-slate-900">CorporateNet</span>
          <p className="brand-caption">NETWORK INTELLIGENCE</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Sidebar navigation">
        <p className="nav-caption">WORKSPACE</p>
        <ul className="space-y-1" role="list">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  aria-label={item.label}
                  title={item.label}
                  end={item.path === '/'}
                  className={({ isActive: active }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                      ? 'nav-active'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p className="font-medium text-slate-800">Designed to understand.</p>
        <p className="text-xs text-slate-500 mt-1">VLSM · OSPF · Connectivity</p>
        <span className="text-xs text-slate-400 block mt-4">CorporateNet / 1.0 (Frontend Only)</span>
      </div>
    </aside>
  );
};