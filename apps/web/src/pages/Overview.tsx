import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, StatusBadge, Button } from '@/components/common';
import { labDevices, labLinks, labDepartments, labOspf } from '@/data/labData';

function ServerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2 4h.01M17 16h.01" />
    </svg>
  );
}

function NetworkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SwitchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function SubnetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function RouteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

interface QuickLinkProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
}

const QuickLink: React.FC<QuickLinkProps> = ({ title, description, icon, href, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  };

  return (
    <Link to={href} className="block p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors h-full">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  href?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, href }) => (
  <Card className={href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}>
    {href ? (
      <Link to={href} className="block">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              {icon}
            </div>
          </div>
          {trend && (
            <p className={`mt-3 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
      </Link>
    ) : (
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        </div>
        {trend && (
          <p className={`mt-3 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </p>
        )}
      </div>
    )}
  </Card>
);

export const Overview: React.FC = () => {
  // Compute stats from local lab data
  const routers = labDevices.filter(d => d.type === 'router');
  const switches = labDevices.filter(d => d.type === 'switch');
  const totalHosts = labDepartments.reduce((sum, d) => sum + d.hostRequirement, 0);
  const totalUsable = labDepartments.reduce((sum, d) => {
    const prefix = parseInt(d.networkCidr.split('/')[1]);
    return sum + 2 ** (32 - prefix) - 2;
  }, 0);
  const utilization = totalUsable > 0 ? Math.round((totalHosts / totalUsable) * 100) : 0;

  const serialLinks = labLinks.filter(l => l.medium === 'serial');

  return (
    <div className="space-y-6">
      <div className="hero">
        <p className="eyebrow mb-3">YOUR NETWORK, CLEARLY CONNECTED</p>
        <h2>A little clarity.<br />Across every connection.</h2>
        <p className="text-slate-500 text-sm mt-4 max-w-2xl">
          Explore the 43-device Packet Tracer topology, trace packet paths, understand every device's purpose, 
          and learn the VLSM addressing — all from a pure frontend dashboard.
        </p>
        <div className="hero-action flex flex-wrap items-center gap-3 mt-6">
          <Button asChild><Link to="/simulation">Start Guided Simulation <span aria-hidden="true">→</span></Link></Button>
          <Button variant="secondary" asChild><Link to="/topology">Explore Topology <span aria-hidden="true">→</span></Link></Button>
          <span className="text-xs text-slate-500 font-mono">10.10.0.0/23 · OSPF Area 0 · 43 Devices</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Devices"
          value={labDevices.length}
          icon={<DeviceIcon className="w-6 h-6" />}
          href="/topology"
        />
        <StatCard
          title="Departments"
          value={labDepartments.length}
          icon={<ServerIcon className="w-6 h-6" />}
          href="/device-guide"
        />
        <StatCard
          title="Subnets Allocated"
          value={labDepartments.length + serialLinks.length}
          icon={<NetworkIcon className="w-6 h-6" />}
          href="/vlsm"
        />
        <StatCard
          title="Address Utilization"
          value={`${utilization}%`}
          icon={<CheckIcon className="w-6 h-6" />}
          trend={`${totalHosts} of ${totalUsable} addresses used`}
          trendUp={utilization < 80}
          href="/vlsm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hosts</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Network</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gateway</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mask</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {labDepartments.map((dept) => {
                    const prefix = parseInt(dept.networkCidr.split('/')[1]);
                    const usable = 2 ** (32 - prefix) - 2;
                    return (
                      <tr key={dept.name} className="hover:bg-slate-50">
                        <td className="px-5 py-4 font-medium text-slate-900">{dept.name}</td>
                        <td className="px-5 py-4 text-slate-600">{dept.hostRequirement}</td>
                        <td className="px-5 py-4 font-mono text-sm text-slate-700">{dept.networkCidr}</td>
                        <td className="px-5 py-4 font-mono text-sm text-slate-700">{dept.gateway}</td>
                        <td className="px-5 py-4 font-mono text-sm text-slate-700">{dept.subnetMask}</td>
                        <td className="px-5 py-4 text-slate-600">{usable}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-body space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">OSPF Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Process ID</p>
                <p className="font-mono text-slate-900">{labOspf.processId}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Area</p>
                <p className="font-mono text-slate-900">{labOspf.areas.join(', ')}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Router IDs</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(labOspf.routerIds).map(([router, id]) => (
                  <Badge key={router} variant="info">{router}: {id}</Badge>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <StatusBadge status="configured" />
              <span className="text-sm text-slate-500 ml-2">From Packet Tracer lab · verify in .pkt</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <QuickLink
          title="Guided Simulation"
          description="10-step packet walkthrough with narration"
          icon={<RouteIcon className="w-5 h-5" />}
          href="/simulation"
          color="blue"
        />
        <QuickLink
          title="Topology Explorer"
          description="Interactive 43-device graph with path tracing"
          icon={<SwitchIcon className="w-5 h-5" />}
          href="/topology"
          color="green"
        />
        <QuickLink
          title="Device Guide"
          description="All 43 devices with purpose & justification"
          icon={<DeviceIcon className="w-5 h-5" />}
          href="/device-guide"
          color="purple"
        />
        <QuickLink
          title="VLSM Calculator"
          description="Client-side subnet allocation tool"
          icon={<SubnetIcon className="w-5 h-5" />}
          href="/vlsm"
          color="orange"
        />
        <QuickLink
          title="Architecture Docs"
          description="Complete design documentation"
          icon={<NetworkIcon className="w-5 h-5" />}
          href="/architecture"
          color="indigo"
        />
      </div>

      <Card>
        <div className="card-body p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
            {routers.map((router) => (
              <div key={router.id} className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900">{router.name}</h4>
                <p className="text-sm text-slate-500 mt-1">Model: {router.model ?? 'N/A'}</p>
                <p className="text-sm text-slate-500">Mgmt IP: {router.managementIp ?? 'N/A'}</p>
                <p className="text-sm text-slate-500">Router ID: {labOspf.routerIds[router.id] ?? 'N/A'}</p>
              </div>
            ))}
            {switches.filter(s => ['core', 'servers', 'west', 'east'].includes(s.id)).map((sw) => (
              <div key={sw.id} className="p-4 bg-slate-50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-medium text-slate-900">{sw.name}</h4>
                <p className="text-sm text-slate-500 mt-1">Model: {sw.model ?? 'N/A'}</p>
                <p className="text-sm text-slate-500">Mgmt IP: {sw.managementIp ?? 'N/A'}</p>
                <p className="text-sm text-slate-500">Router ID: {labOspf.routerIds[sw.id] ?? 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="border-green-300 bg-green-50">
        <div className="card-body">
          <h3 className="font-semibold text-green-900 mb-2">Pure Frontend — No Backend Required</h3>
          <p className="text-green-700 text-sm">
            This dashboard runs entirely in the browser. All topology data, VLSM calculations, and simulations 
            use local TypeScript data structures. No API server, no MongoDB, no Node.js runtime needed.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="success">43 Devices Loaded</Badge>
            <Badge variant="success">43 Links Mapped</Badge>
            <Badge variant="success">5 Departments</Badge>
            <Badge variant="success">OSPF Area 0</Badge>
            <Badge variant="success">Client-Side VLSM</Badge>
            <Badge variant="info">TEST-NET Addresses</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
