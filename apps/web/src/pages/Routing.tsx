import { findPath } from '@/utils/simulation';
import React, { useEffect, useState } from 'react';
import { designsApi } from '@/api/designs';
import { NetworkDesign, RoutingInfo } from '@/types';
import { Card, CardHeader, CardFooter, Badge, Table } from '@/components/common';

export const Routing: React.FC = () => {
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [routing, setRouting] = useState<RoutingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'neighbors' | 'routes' | 'evidence'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const designs = await designsApi.list();
        if (designs.length > 0) {
          const d = designs[0];
          setDesign(d);
          const r = await designsApi.getRouting(d._id);
          setRouting(r);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load routing data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (error) {
    return (
      <Card>
        <div className="p-6 text-center text-red-600">Error: {error}</div>
      </Card>
    );
  }

  if (!design || !routing) {
    return (
      <Card>
        <div className="p-6 text-center text-slate-500">No design loaded</div>
      </Card>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <OverviewIcon /> },
    { id: 'neighbors', label: 'OSPF Neighbors', icon: <NeighborsIcon /> },
    { id: 'routes', label: 'Route Table', icon: <RoutesIcon /> },
    { id: 'evidence', label: 'CLI Evidence', icon: <EvidenceIcon /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab design={design} routing={routing} />}
      {activeTab === 'neighbors' && <NeighborsTab design={design} />}
      {activeTab === 'routes' && <RoutesTab design={design} routing={routing} />}
      {activeTab === 'evidence' && <EvidenceTab />}
    </div>
  );
};

function OverviewTab({ design, routing }: { design: NetworkDesign; routing: RoutingInfo }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">OSPF Configuration</h3>
        </CardHeader>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Process ID</p>
              <p className="font-mono text-slate-900">{routing.ospf.processId}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Areas</p>
              <p className="font-mono text-slate-900">{routing.ospf.areas.join(', ')}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Router IDs</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(routing.ospf.routerIds).map(([router, id]) => (
                <Badge key={router} variant="info">{router}: {id}</Badge>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <h4 className="font-medium text-slate-900 mb-2">Advertised Networks (Expected)</h4>
            <div className="space-y-1 font-mono text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
              {design.departments.map((dept) => (
                <div key={dept.name}>{dept.networkCidr} · area {design.ospf.areas[0]}</div>
              ))}
              {design.links.filter((l) => l.medium === 'serial').map((link) => (
                <div key={link.linkId}>{link.networkCidr} · area {design.ospf.areas[0]}</div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Quick Stats</h3>
        </CardHeader>
        <div className="card-body space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Routes</p>
            <p className="text-2xl font-bold text-slate-900">{new Set(design.interfaces.map((i) => i.networkCidr).filter(Boolean)).size}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Connected Networks</p>
            <p className="text-2xl font-bold text-slate-900">{new Set(design.interfaces.map((i) => i.networkCidr).filter(Boolean)).size}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">OSPF Areas</p>
            <p className="text-2xl font-bold text-slate-900">{routing.ospf.areas.length}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Router Count</p>
            <p className="text-2xl font-bold text-slate-900">{Object.keys(routing.ospf.routerIds).length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function NeighborsTab({ design }: { design: NetworkDesign }) {
  const neighbors = design.links.filter((link) => design.devices.some((d) => d.deviceId === link.sourceDeviceId && d.type === 'router') && design.devices.some((d) => d.deviceId === link.targetDeviceId && d.type === 'router')).flatMap((link) => [
    { local: link.sourceDeviceId, remote: link.targetDeviceId, iface: link.sourceInterface },
    { local: link.targetDeviceId, remote: link.sourceDeviceId, iface: link.targetInterface },
  ].map(({ local, remote, iface }) => ({
    router: design.devices.find((d) => d.deviceId === local)?.hostname ?? local,
    neighbor: design.devices.find((d) => d.deviceId === remote)?.hostname ?? remote,
    interface: iface, state: 'Expected', deadTime: 'Not measured',
    address: design.interfaces.find((i) => i.deviceId === remote && i.networkCidr === link.networkCidr)?.ipAddress ?? 'Unassigned',
  })));
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">OSPF Neighbor Adjacencies</h3>
        <Badge variant="neutral">Design expectations</Badge>
      </CardHeader>
      <div className="card-body p-0">
        <Table
          columns={[
            { key: 'router', header: 'Local Router' },
            { key: 'neighbor', header: 'Neighbor Router' },
            { key: 'interface', header: 'Local Interface' },
            { key: 'state', header: 'State', render: (row) => <Badge variant={row.state === 'FULL' ? 'success' : 'warning'}>{row.state}</Badge> },
            { key: 'address', header: 'Neighbor Address', render: (row) => <code className="font-mono text-sm">{row.address}</code> },
            { key: 'deadTime', header: 'Dead Time', render: (row) => <code className="font-mono text-sm">{row.deadTime}</code> },
          ]}
          data={neighbors}
          keyExtractor={(row) => `${row.router}-${row.neighbor}`}
          striped
        />
      </div>
      <CardFooter>
        <p className="text-sm text-slate-500">
          <strong>Note:</strong> Neighbor data is derived from this design; no live adjacency evidence has been collected.
          Run <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">show ip ospf neighbor</code> on each router to verify.
        </p>
      </CardFooter>
    </Card>
  );
}

function RoutesTab({ design, routing }: { design: NetworkDesign; routing: RoutingInfo }) {
  const routers = design.devices.filter((device) => device.type === 'router');
  const [routerId, setRouterId] = useState(routers[0]?.deviceId ?? '');
  const networks = [...new Set(design.interfaces.map((iface) => iface.networkCidr).filter((network): network is string => Boolean(network)))];
  const allRoutes = networks.flatMap((network) => {
    const owners = design.interfaces.filter((iface) => iface.networkCidr === network).map((iface) => iface.deviceId);
    const connected = owners.includes(routerId);
    const path = owners.map((owner) => findPath(design.links, routerId, owner)).filter((route): route is string[] => route !== null).sort((a, b) => a.length - b.length)[0];
    if (!path) return [];
    const firstLink = design.links.find((link) => link.linkId === path[0]);
    const nextDevice = firstLink?.sourceDeviceId === routerId ? firstLink.targetDeviceId : firstLink?.sourceDeviceId;
    return [{
      code: connected ? 'C' : 'O', network,
      nextHop: connected ? 'Directly connected' : design.interfaces.find((iface) => iface.deviceId === nextDevice && iface.networkCidr === firstLink?.networkCidr)?.ipAddress ?? 'Unassigned',
      interface: connected ? routing.interfaces.find((iface) => iface.deviceId === routerId && iface.networkCidr === network)?.interfaceName ?? 'N/A' : firstLink?.sourceDeviceId === routerId ? firstLink.sourceInterface : firstLink?.targetInterface ?? 'N/A',
      source: connected ? 'Connected' : 'Expected OSPF',
    }];
  });
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">IP Routing Table (Expected)</h3><label className="text-sm">Router <select className="input" value={routerId} onChange={(e) => setRouterId(e.target.value)}>{routers.map((router) => <option key={router.deviceId} value={router.deviceId}>{router.hostname}</option>)}</select></label>
        <div className="flex gap-2">
          <Badge variant="info">C - Connected</Badge>
          <Badge variant="success">O - OSPF</Badge>
        </div>
      </CardHeader>
      <div className="card-body p-0">
        <Table
          columns={[
            { key: 'code', header: 'Code', render: (row) => <Badge variant={row.code === 'C' ? 'info' : 'success'}>{row.code}</Badge> },
            { key: 'network', header: 'Network', render: (row) => <code className="font-mono text-sm">{row.network}</code> },
            { key: 'nextHop', header: 'Next Hop / Type', render: (row) => <span className="text-slate-700">{row.nextHop}</span> },
            { key: 'interface', header: 'Interface', render: (row) => <code className="font-mono text-sm">{row.interface}</code> },
            { key: 'source', header: 'Source' },
          ]}
          data={allRoutes}
          keyExtractor={(row) => `${row.network}-${row.code}`}
          striped
        />
      </div>
      <CardFooter>
        <p className="text-sm text-slate-500">
          This table shows <strong>expected</strong> routes based on the network design.
          Compare with actual <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">show ip route</code> output from Packet Tracer.
        </p>
      </CardFooter>
    </Card>
  );
}

function EvidenceTab() {
  const evidence = [
    { router: 'R1', command: 'show ip ospf neighbor', output: 'Neighbor ID     Pri  State       Dead Time   Address         Interface\n2.2.2.2         1    FULL/DR      00:00:32    10.10.1.18      Serial0/0/0', verified: false },
    { router: 'R1', command: 'show ip route ospf', output: 'O    10.10.0.192/27 [110/128] via 10.10.1.18, 00:05:12, Serial0/0/0\nO    10.10.0.224/27 [110/128] via 10.10.1.18, 00:05:12, Serial0/0/0\nO    10.10.1.0/28 [110/128] via 10.10.1.18, 00:05:12, Serial0/0/0\nO    10.10.1.20/30 [110/128] via 10.10.1.18, 00:05:12, Serial0/0/0', verified: false },
    { router: 'R2', command: 'show ip ospf neighbor', output: 'Neighbor ID     Pri  State       Dead Time   Address         Interface\n1.1.1.1         1    FULL/BDR     00:00:35    10.10.1.17      Serial0/0/0\n3.3.3.3         1    FULL/DR      00:00:30    10.10.1.22      Serial0/0/1', verified: false },
    { router: 'R3', command: 'show ip route', output: 'Gateway of last resort is not set\n\nC    10.10.1.0/28 is directly connected, GigabitEthernet0/0\nC    10.10.1.20/30 is directly connected, Serial0/0/0\nO    10.10.0.0/25 [110/65] via 10.10.1.21, 00:04:22, Serial0/0/0\nO    10.10.0.128/26 [110/65] via 10.10.1.21, 00:04:22, Serial0/0/0\nO    10.10.0.192/27 [110/65] via 10.10.1.21, 00:04:22, Serial0/0/0\nO    10.10.0.224/27 [110/65] via 10.10.1.21, 00:04:22, Serial0/0/0\nO    10.10.1.16/30 [110/65] via 10.10.1.21, 00:04:22, Serial0/0/0', verified: false },
  ];

  return (
    <div className="space-y-4">
      {evidence.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="info">{item.router}</Badge>
              <code className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{item.command}</code>
            </div>
            <Badge variant={item.verified ? 'success' : 'warning'}>
              {item.verified ? 'Verified' : 'Illustrative example'}
            </Badge>
          </CardHeader>
          <div className="card-body p-0">
            <pre className="p-4 bg-slate-900 text-green-300 font-mono text-sm overflow-x-auto max-h-64">
              {item.output}
            </pre>
          </div>
        </Card>
      ))}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Verification Checklist</h3>
        </CardHeader>
        <div className="card-body space-y-2">
          {[
            'Interface IP addresses match design',
            'OSPF process ID configured on all routers',
            'All interfaces in correct OSPF area',
            'Passive interfaces configured for LANs',
            'OSPF adjacencies FULL on all serial links',
            'All departmental networks in route tables',
            'Ping between all department PCs successful',
            'Traceroute shows correct path',
            'DHCP leases assigned correctly',
          ].map((item, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-slate-700">{item}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}

function OverviewIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
}
function NeighborsIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
function RoutesIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
}
function EvidenceIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
}

