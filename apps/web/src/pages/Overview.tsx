import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { designsApi } from '../../api/designs';
import { NetworkDesign } from '../../types';
import { Card, CardHeader, CardFooter, Badge, StatusBadge } from '../../components/common';
import { Button } from '../../components/common/Button';

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

function RouterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

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

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

interface QuickLinkProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const QuickLink: React.FC<QuickLinkProps> = ({ title, description, icon, href, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
  };

  return (
    <Link to={href} className={`block p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors h-full`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
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

function TestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export const Overview: React.FC = () => {
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        setLoading(true);
        const designs = await designsApi.list();
        if (designs.length > 0) {
          setDesign(designs[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load design');
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <div className="p-5 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-8 bg-slate-200 rounded w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center">
          <AlertIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">Unable to load dashboard</h3>
          <p className="text-slate-500 mt-1">{error}</p>
          <Button variant="primary" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!design) {
    return (
      <Card>
        <div className="p-6 text-center">
          <ServerIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No network design found</h3>
          <p className="text-slate-500 mt-1">Create a design to get started</p>
          <Button variant="primary" className="mt-4" asChild>
            <Link to="/vlsm">Create Design</Link>
          </Button>
        </div>
      </Card>
    );
  }

  const totalHosts = design.departments.reduce((sum, d) => sum + d.hostRequirement, 0);
  const totalUsable = design.departments.reduce((sum, d) => {
    const prefix = parseInt(d.networkCidr.split('/')[1]);
    return sum + (1 << (32 - prefix)) - 2;
  }, 0);
  const utilization = totalUsable > 0 ? Math.round((totalHosts / totalUsable) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Routers"
          value={design.devices.filter((d) => d.type === 'router').length}
          icon={<RouterIcon className="w-6 h-6" />}
          href="/topology"
        />
        <StatCard
          title="Departments"
          value={design.departments.length}
          icon={<ServerIcon className="w-6 h-6" />}
          href="/topology"
        />
        <StatCard
          title="Subnets Allocated"
          value={design.departments.length + design.links.filter((l) => l.medium === 'serial').length}
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
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Department Subnets</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/vlsm">View All</Link>
            </Button>
          </CardHeader>
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
                  {design.departments.map((dept) => {
                    const prefix = parseInt(dept.networkCidr.split('/')[1]);
                    const usable = (1 << (32 - prefix)) - 2;
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
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">OSPF Status</h2>
          </CardHeader>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Process ID</span>
              <span className="font-mono text-slate-900">{design.ospf.processId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Area</span>
              <span className="font-mono text-slate-900">{design.ospf.areas.join(', ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Router IDs</span>
              <div className="flex gap-2">
                {Object.entries(design.ospf.routerIds).map(([router, id]) => (
                  <Badge key={router} variant="info">{router}: {id}</Badge>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <StatusBadge status="configured" />
              <span className="text-sm text-slate-500 ml-2">Configuration validated in Packet Tracer</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickLink
          title="Topology Explorer"
          description="Visualize routers, switches, and links"
          icon={<SwitchIcon className="w-5 h-5" />}
          href="/topology"
          color="blue"
        />
        <QuickLink
          title="VLSM Studio"
          description="Calculate and modify subnet allocations"
          icon={<SubnetIcon className="w-5 h-5" />}
          href="/vlsm"
          color="green"
        />
        <QuickLink
          title="Routing Lab"
          description="View OSPF routes and neighbor evidence"
          icon={<RouteIcon className="w-5 h-5" />}
          href="/routing"
          color="purple"
        />
        <QuickLink
          title="Diagnostics"
          description="Run and record connectivity tests"
          icon={<TestIcon className="w-5 h-5" />}
          href="/diagnostics"
          color="orange"
        />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Router Configurations</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/routing">View Details</Link>
          </Button>
        </CardHeader>
        <div className="card-body p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
            {design.devices.filter((d) => d.type === 'router').map((router) => (
              <div key={router.deviceId} className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900">{router.hostname}</h4>
                <p className="text-sm text-slate-500 mt-1">Model: {router.model ?? 'N/A'}</p>
                <p className="text-sm text-slate-500">Mgmt IP: {router.managementIp ?? 'N/A'}</p>
                <p className="text-sm text-slate-500">Router ID: {design.ospf.routerIds[router.hostname] ?? 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};