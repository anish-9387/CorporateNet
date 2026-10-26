import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ReactFlow, Background, Controls, Handle, Position, BaseEdge, getSmoothStepPath, type Node, type NodeProps, type Edge, type EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { designsApi } from '@/api/designs';
import type { NetworkDesign, Device } from '@/types';
import { Badge, Button, Card } from '@/components/common';
import { findPath, layoutDevices } from '@/utils/simulation';

type DeviceNodeType = Node<{ device: Device; addresses: string[] }>;
type PacketEdgeType = Edge<{ active: boolean; duration: number }>;

function DeviceNode({ data, selected }: NodeProps<DeviceNodeType>) {
  return <div className={`device-node ${data.device.type} ${selected ? 'selected' : ''}`}>
    <Handle type="target" position={Position.Left} />
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h10M7 14h2m3 0h2m3 0h1" /></svg>
      </div>
      <div><h3 className="font-semibold text-sm text-slate-900">{data.device.hostname}</h3><p className="text-[10px] uppercase tracking-widest text-slate-500">{data.device.type}</p></div>
    </div>
    <p className="text-[10px] text-slate-500 mt-3 font-mono">{data.addresses[0] ?? data.device.model ?? 'Network device'}</p>
    <Handle type="source" position={Position.Right} />
  </div>;
}

function PacketEdge(props: EdgeProps<PacketEdgeType>) {
  const [path] = getSmoothStepPath(props);
  return <>
    <BaseEdge id={props.id} path={path} style={props.style} label={props.label} labelStyle={{ fontSize: 10, fill: '#71717a' }} labelBgStyle={{ fill: '#fafafa' }} labelX={(props.sourceX + props.targetX) / 2} labelY={(props.sourceY + props.targetY) / 2 - 12} />
    {props.data?.active && <circle r="4" fill="#52525b" className="packet-dot"><animateMotion dur={`${props.data.duration}s`} repeatCount="indefinite" path={path} /></circle>}
  </>;
}
const nodeTypes = { device: DeviceNode };
const edgeTypes = { packet: PacketEdge };

export const Topology: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(true);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [failedLink, setFailedLink] = useState('');
  const [duration, setDuration] = useState(2);
  const [selected, setSelected] = useState<Device | null>(null);

  useEffect(() => {
    designsApi.list().then((designs) => {
      const first = designs[0];
      if (first) {
        setDesign(first);
        const requestedLink = searchParams.get('failedLink');
        setFailedLink(first.links.some((link) => link.linkId === requestedLink) ? requestedLink! : '');
        const routers = first.devices.filter((device) => device.type === 'router');
        setSource(routers[0]?.deviceId ?? first.devices[0]?.deviceId ?? '');
        setDestination(routers[routers.length - 1]?.deviceId ?? first.devices[first.devices.length - 1]?.deviceId ?? '');
      }
    }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, [searchParams]);

  const route = useMemo(() => design ? findPath(design.links, source, destination, failedLink) : null, [design, source, destination, failedLink]);
  const nodes: DeviceNodeType[] = useMemo(() => design ? layoutDevices(design).map(({ device, position }) => ({
    id: device.deviceId, type: 'device', position,
    data: { device, addresses: design.interfaces.filter((iface) => iface.deviceId === device.deviceId).map((iface) => iface.ipAddress ?? iface.networkCidr ?? '') },
  })) : [], [design]);
  const edges: PacketEdgeType[] = useMemo(() => design ? design.links.map((link) => {
    const failed = failedLink === link.linkId;
    const active = Boolean(route?.includes(link.linkId));
    let current = source;
    for (const id of route ?? []) {
      if (id === link.linkId) break;
      const previous = design.links.find((item) => item.linkId === id)!;
      current = previous.sourceDeviceId === current ? previous.targetDeviceId : previous.sourceDeviceId;
    }
    const reverse = active && current !== link.sourceDeviceId;
    return { id: link.linkId, source: reverse ? link.targetDeviceId : link.sourceDeviceId, target: reverse ? link.sourceDeviceId : link.targetDeviceId, type: 'packet', label: link.networkCidr,
      data: { active: running && active && !failed, duration },
      style: { stroke: failed ? '#dc2626' : active ? '#52525b' : '#d4d4d8', strokeWidth: active ? 2.5 : 1.5, strokeDasharray: failed ? '5 5' : undefined },
    };
  }) : [], [design, failedLink, route, source, running, duration]);
  const hostname = (id: string) => design?.devices.find((device) => device.deviceId === id)?.hostname ?? id;

  if (loading) return <div className="h-64 flex items-center justify-center" role="status"><span className="spinner" /><span className="sr-only">Loading topology</span></div>;
  if (error || !design) return <Card><div className="p-6" role="alert">{error || 'No design found. Seed the database or save a design in VLSM Studio.'}</div></Card>;

  return <div className="space-y-5">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div><p className="eyebrow mb-2">THE NETWORK, IN MOTION</p><h2 className="text-2xl font-medium tracking-tight text-slate-900">Explore every connection.</h2><p className="text-sm text-slate-500 mt-1">Select devices, follow a route, or take a link offline.</p></div>
      <Badge variant="neutral">Educational simulation</Badge>
    </div>
    <Card><div className="card-body simulation-toolbar">
      <label>From<select aria-label="Source device" className="input" value={source} onChange={(e) => setSource(e.target.value)}>{design.devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.hostname}</option>)}</select></label>
      <label>To<select aria-label="Destination device" className="input" value={destination} onChange={(e) => setDestination(e.target.value)}>{design.devices.map((device) => <option key={device.deviceId} value={device.deviceId}>{device.hostname}</option>)}</select></label>
      <label>Link state<select aria-label="Failed link" className="input" value={failedLink} onChange={(e) => setFailedLink(e.target.value)}><option value="">All links healthy</option>{design.links.map((link) => <option key={link.linkId} value={link.linkId}>{hostname(link.sourceDeviceId)} ↔ {hostname(link.targetDeviceId)} offline</option>)}</select></label>
      <label>Speed<select aria-label="Simulation speed" className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}><option value={4}>0.5×</option><option value={2}>1×</option><option value={1}>2×</option></select></label>
      <Button onClick={() => setRunning(!running)}>{running ? 'Pause simulation' : 'Resume simulation'}</Button>
      <Button variant="secondary" onClick={() => { setFailedLink(''); setRunning(true); setDuration(2); }}>Reset</Button>
    </div></Card>
    <div className="simulation-canvas" aria-label="Interactive network topology">
      <ReactFlow defaultNodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: .22 }} nodesConnectable={false} edgesReconnectable={false} onNodeClick={(_event, node) => setSelected(node.data.device)} onPaneClick={() => setSelected(null)} minZoom={.2}>
        <Background color="#dedee3" gap={22} size={1} /><Controls showInteractive={false} />
      </ReactFlow>
    </div>
    <div className="simulation-readout" role="status" aria-live="polite">
      <div><p className="eyebrow mb-1">{running ? 'SIMULATION RUNNING' : 'SIMULATION PAUSED'}</p><p className="font-medium">{hostname(source)} → {hostname(destination)}</p></div>
      <Badge variant={route ? 'success' : 'error'}>{route ? `Reachable · ${route.length} hops` : 'Unreachable · no alternate path'}</Badge>
      <p className="text-xs text-slate-500">{failedLink ? 'Link removed from route calculation. Restore it to reconnect.' : 'Moving dots show the selected path. Drag devices to explore.'}</p>
    </div>
    {selected && <Card><div className="card-body"><h3 className="font-semibold">{selected.hostname} <span className="font-normal text-slate-500">/ {selected.model ?? selected.type}</span></h3><div className="flex flex-wrap gap-3 mt-3">{design.interfaces.filter((iface) => iface.deviceId === selected.deviceId).map((iface) => <code key={iface.interfaceName} className="bg-slate-100 px-3 py-2 rounded-lg text-xs">{iface.interfaceName} · {iface.ipAddress ?? 'Unassigned'} · {iface.networkCidr}</code>)}</div></div></Card>}
    <p className="text-xs text-slate-500">This graph models reachability from the saved links. It does not send real packets or emulate OSPF convergence timers. Use Packet Tracer to validate the router configuration.</p>
  </div>;
};
