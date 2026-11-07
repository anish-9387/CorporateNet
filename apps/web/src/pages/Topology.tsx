import React, { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, BaseEdge, getSmoothStepPath, type Node, type NodeProps, type Edge, type EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Badge, Button, Card, CardHeader } from '@/components/common';
import { findPath, layoutDevices } from '@/utils/simulation';
import { labDevices, labLinks, labInterfaces, devicePositions } from '@/data/labData';
import type { Device, Link, NetworkInterface } from '@/types';

type DeviceNodeType = Node<{ device: Device; addresses: string[] }>;
type PacketEdgeType = Edge<{ active: boolean; duration: number }>;

function DeviceNode({ data, selected }: NodeProps<DeviceNodeType>) {
  const typeColors: Record<string, string> = {
    router: 'bg-blue-100 border-blue-300',
    switch: 'bg-purple-100 border-purple-300',
    server: 'bg-green-100 border-green-300',
    pc: 'bg-slate-100 border-slate-300',
    laptop: 'bg-orange-100 border-orange-300',
    wireless: 'bg-pink-100 border-pink-300',
    controller: 'bg-indigo-100 border-indigo-300',
  };

  return (
    <div className={`device-node ${data.device.type} ${selected ? 'selected' : ''} ${typeColors[data.device.type] || ''} border-2`}>
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center gap-3 p-3">
        <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            {data.device.type === 'server' && <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h10M7 14h2m3 0h2m3 0h1" /></>}
            {data.device.type === 'router' && <><rect x="2" y="5" width="20" height="14" rx="6" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
            {(data.device.type === 'switch') && <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
            {(data.device.type === 'pc' || data.device.type === 'laptop') && <><rect x="4" y="3" width="16" height="13" rx="2" /><path d={data.device.type === 'laptop' ? 'M4 16l-2 5h20l-2-5' : 'M12 16v5m-5 0h10'} /></>}
            {(data.device.type === 'wireless' || data.device.type === 'controller') && <><rect x="5" y="15" width="14" height="6" rx="2" /><path d="M12 15V9M8 11a6 6 0 018 0M5 7a10 10 0 0114 0" /></>}
          </svg>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-slate-900 truncate">{data.device.hostname}</h3>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">{data.device.type}</p>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 px-3 pb-3 font-mono">{data.addresses[0] ?? data.device.managementIp ?? 'Network device'}</p>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function PacketEdge(props: EdgeProps<PacketEdgeType>) {
  const [path] = getSmoothStepPath(props);
  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        style={props.style}
        label={props.label}
        labelStyle={{ fontSize: 10, fill: '#71717a' }}
        labelBgStyle={{ fill: '#fafafa' }}
        labelX={(props.sourceX + props.targetX) / 2}
        labelY={(props.sourceY + props.targetY) / 2 - 12}
      />
      {props.data?.active && (
        <circle r="4" fill="#52525b" className="packet-dot">
          <animateMotion dur={`${props.data.duration}s`} repeatCount="indefinite" path={path} />
        </circle>
      )}
    </>
  );
}

const nodeTypes = { device: DeviceNode };
const edgeTypes = { packet: PacketEdge };

export const Topology: React.FC = () => {
  const [running, setRunning] = useState(true);
  const [source, setSource] = useState('pc3');
  const [destination, setDestination] = useState('server4');
  const [failedLink, setFailedLink] = useState('');
  const [duration, setDuration] = useState(2);
  const [selected, setSelected] = useState<Device | null>(null);
  const [viewMode, setViewMode] = useState<'path' | 'full'>('path');

  // Convert lab data to Device/Link/Interface format
  const devices: Device[] = useMemo(() => labDevices.map(d => ({
    deviceId: d.id,
    hostname: d.name,
    type: d.type,
    model: d.model,
    managementIp: d.managementIp,
  })), []);

  const links: Link[] = useMemo(() => labLinks.map(l => ({
    linkId: l.linkId,
    sourceDeviceId: l.sourceDeviceId,
    sourceInterface: l.sourceInterface,
    targetDeviceId: l.targetDeviceId,
    targetInterface: l.targetInterface,
    networkCidr: l.networkCidr,
    medium: l.medium,
  })), []);

  const interfaces: NetworkInterface[] = useMemo(() => labInterfaces.map(i => ({
    deviceId: i.deviceId,
    interfaceName: i.interfaceName,
    ipAddress: i.ipAddress,
    subnetMask: i.subnetMask,
    networkCidr: i.networkCidr,
    passiveOspf: i.passiveOspf,
  })), []);

  const route = useMemo(() => 
    viewMode === 'path' ? findPath(links, source, destination, failedLink) : null, 
    [links, source, destination, failedLink, viewMode]
  );

  const nodes: DeviceNodeType[] = useMemo(() => {
    const positioned = layoutDevices(devices, links);
    return positioned.map(({ deviceId, position }) => {
      const device = devices.find(d => d.deviceId === deviceId)!;
      const pos = devicePositions[deviceId] ?? position;
      const addrs = interfaces
        .filter((iface) => iface.deviceId === deviceId)
        .map((iface) => iface.ipAddress ?? iface.networkCidr ?? '')
        .filter(Boolean);
      return {
        id: deviceId,
        type: 'device',
        position: pos,
        data: { device, addresses: addrs },
      };
    });
  }, [devices, links, interfaces]);

  const edges: PacketEdgeType[] = useMemo(() => {
    return links.map((link) => {
      const failed = failedLink === link.linkId;
      const active = Boolean(route?.includes(link.linkId));
      let current = source;
      for (const id of route ?? []) {
        if (id === link.linkId) break;
        const previous = links.find((item) => item.linkId === id)!;
        current = previous.sourceDeviceId === current ? previous.targetDeviceId : previous.sourceDeviceId;
      }
      const reverse = active && current !== link.sourceDeviceId;
      return {
        id: link.linkId,
        source: reverse ? link.targetDeviceId : link.sourceDeviceId,
        target: reverse ? link.sourceDeviceId : link.targetDeviceId,
        type: 'packet',
        label: link.networkCidr || undefined,
        data: { active: running && active && !failed, duration },
        style: { 
          stroke: failed ? '#dc2626' : active ? '#52525b' : '#d4d4d8', 
          strokeWidth: active ? 2.5 : 1.5, 
          strokeDasharray: failed ? '5 5' : link.medium === 'wireless' ? '3 5' : undefined 
        },
      };
    });
  }, [links, failedLink, route, source, running, duration]);

  const hostname = (id: string) => devices.find((device) => device.deviceId === id)?.hostname ?? id;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="eyebrow mb-2">NETWORK TOPOLOGY EXPLORER</p>
          <h2 className="text-2xl font-medium tracking-tight text-slate-900">Interactive 43-Device Topology</h2>
          <p className="text-sm text-slate-500 mt-1">Select source/destination to trace paths, simulate link failures, and inspect devices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">43 Devices</Badge>
          <Badge variant="info">43 Links</Badge>
          <Badge variant="neutral">Local Data</Badge>
        </div>
      </div>

      <Card>
        <div className="card-body simulation-toolbar flex flex-wrap gap-4">
          <label className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Mode:</span>
            <select 
              className="input" 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value as 'path' | 'full')}
            >
              <option value="path">Path Trace</option>
              <option value="full">Full Topology</option>
            </select>
          </label>
          
          {viewMode === 'path' && (
            <>
              <label className="flex items-center gap-2">
                <span className="text-sm text-slate-600">From:</span>
                <select aria-label="Source device" className="input" value={source} onChange={(e) => setSource(e.target.value)}>
                  {devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.hostname}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm text-slate-600">To:</span>
                <select aria-label="Destination device" className="input" value={destination} onChange={(e) => setDestination(e.target.value)}>
                  {devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.hostname}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Failed Link:</span>
                <select aria-label="Failed link" className="input" value={failedLink} onChange={(e) => setFailedLink(e.target.value)}>
                  <option value="">All links healthy</option>
                  {links.map((link) => (
                    <option key={link.linkId} value={link.linkId}>
                      {hostname(link.sourceDeviceId)} ↔ {hostname(link.targetDeviceId)} offline
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <label className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Speed:</span>
            <select aria-label="Simulation speed" className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              <option value={4}>0.5×</option>
              <option value={2}>1×</option>
              <option value={1}>2×</option>
            </select>
          </label>
          
          <Button onClick={() => setRunning(!running)}>
            {running ? 'Pause Animation' : 'Resume Animation'}
          </Button>
          <Button variant="secondary" onClick={() => { setFailedLink(''); setRunning(true); setDuration(2); }}>
            Reset
          </Button>
        </div>
      </Card>

      <div className="simulation-canvas" aria-label="Interactive network topology">
        <ReactFlow
          defaultNodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesConnectable={false}
          edgesReconnectable={false}
          onNodeClick={(_event, node) => setSelected(node.data.device)}
          onPaneClick={() => setSelected(null)}
          minZoom={0.15}
          maxZoom={2}
        >
          <Background color="#dedee3" gap={22} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <div className="simulation-readout" role="status" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">{running ? 'ANIMATION RUNNING' : 'ANIMATION PAUSED'}</p>
            {viewMode === 'path' && (
              <p className="font-medium">{hostname(source)} → {hostname(destination)}</p>
            )}
          </div>
          {viewMode === 'path' && (
            <Badge variant={route ? 'success' : 'error'}>
              {route ? `Reachable · ${route.length} hops` : 'Unreachable · no alternate path'}
            </Badge>
          )}
          <p className="text-xs text-slate-500">
            {failedLink ? 'Link removed from route calculation. Restore it to reconnect.' : 
             viewMode === 'path' ? 'Moving dots show the selected path. Drag devices to explore.' :
             'Full topology view. Click devices to inspect. Use controls to trace paths.'}
          </p>
        </div>
      </div>

      {selected && (
        <Card>
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    {selected.type === 'server' && <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h10M7 14h2m3 0h2m3 0h1" /></>}
                    {selected.type === 'router' && <><rect x="2" y="5" width="20" height="14" rx="6" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
                    {(selected.type === 'switch') && <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
                    {(selected.type === 'pc' || selected.type === 'laptop') && <><rect x="4" y="3" width="16" height="13" rx="2" /><path d={selected.type === 'laptop' ? 'M4 16l-2 5h20l-2-5' : 'M12 16v5m-5 0h10'} /></>}
                    {(selected.type === 'wireless' || selected.type === 'controller') && <><rect x="5" y="15" width="14" height="6" rx="2" /><path d="M12 15V9M8 11a6 6 0 018 0M5 7a10 10 0 0114 0" /></>}
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">{selected.hostname} <span className="font-normal text-slate-500">/ {selected.model ?? selected.type}</span></h3>
                  <p className="text-sm text-slate-500">{selected.description}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex flex-wrap gap-3">
              {interfaces.filter((iface) => iface.deviceId === selected.deviceId).map((iface) => (
                <code key={iface.interfaceName} className="bg-slate-100 px-3 py-2 rounded-lg text-xs">
                  {iface.interfaceName} · {iface.ipAddress ?? 'Unassigned'} · {iface.networkCidr}
                  {iface.passiveOspf && ' · OSPF Passive'}
                </code>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Legend</h3>
          </CardHeader>
          <div className="card-body space-y-2 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500"></span> Router (L3)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-500"></span> Switch (L2/L3)</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500"></span> Server</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-slate-500"></span> PC</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-500"></span> Laptop</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-pink-500"></span> Wireless/AP</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-indigo-500"></span> Controller</div>
            <div className="flex items-center gap-2"><span className="w-6 h-0.5 bg-slate-500"></span> Ethernet</div>
            <div className="flex items-center gap-2"><span className="w-6 h-0.5 border-t-2 border-dashed border-slate-500"></span> Serial/WAN</div>
            <div className="flex items-center gap-2"><span className="w-6 h-0.5 border-t-2 border-dotted border-slate-500"></span> Wireless</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-slate-500 animate-bounce" /> Packet</div>
            <div className="flex items-center gap-2"><span className="w-6 h-1.5 border-t-2 border-dashed border-red-500" /> Failed Link</div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Quick Stats</h3>
          </CardHeader>
          <div className="card-body grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{devices.length}</p>
              <p className="text-xs text-slate-500">Total Devices</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{links.length}</p>
              <p className="text-xs text-slate-500">Total Links</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{devices.filter(d => d.type === 'router' || d.type === 'switch').length}</p>
              <p className="text-xs text-slate-500">L3 Devices</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{devices.filter(d => d.type === 'pc' || d.type === 'laptop').length}</p>
              <p className="text-xs text-slate-500">End Devices</p>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-slate-900">Departments</h3>
          </CardHeader>
          <div className="card-body space-y-2 text-sm">
            <div className="flex justify-between"><span>Engineering</span><code className="font-mono">10.10.0.0/25</code></div>
            <div className="flex justify-between"><span>Administration</span><code className="font-mono">10.10.0.128/26</code></div>
            <div className="flex justify-between"><span>Finance</span><code className="font-mono">10.10.0.192/27</code></div>
            <div className="flex justify-between"><span>HR</span><code className="font-mono">10.10.0.224/27</code></div>
            <div className="flex justify-between"><span>IT Support</span><code className="font-mono">10.10.1.0/28</code></div>
            <div className="flex justify-between"><span>Servers</span><code className="font-mono">10.10.1.64/28</code></div>
            <div className="flex justify-between pt-2 border-t border-slate-200"><span className="font-medium">ISP Client</span><code className="font-mono">192.168.13.0/24</code></div>
            <div className="flex justify-between"><span className="font-medium">External</span><code className="font-mono">203.0.113.0/24</code></div>
          </div>
        </Card>
      </div>

      <p className="text-xs text-slate-500 text-center">
        Data sourced from <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">Scalable_Corporate_Network_CN.pkt</code> — manually transcribed. 
        This graph models reachability from saved links. It does not send real packets or emulate OSPF convergence timers.
        Use Packet Tracer to validate the router configuration.
      </p>
    </div>
  );
};
