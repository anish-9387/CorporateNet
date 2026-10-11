// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
  type NodeProps,
  type EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { designsApi } from '@/api/designs';
import { NetworkDesign, Device, Link } from '@/types';
import { Card } from '@/components/common';

const DEVICE_COLORS = {
  router: { bg: '#1e40af', border: '#1e3a8a', text: '#dbeafe' },
  switch: { bg: '#059669', border: '#047857', text: '#d1fae5' },
  pc: { bg: '#7c3aed', border: '#6d28d9', text: '#ede9fe' },
  server: { bg: '#dc2626', border: '#b91c1c', text: '#fee2e2' },
};

const MEDIUM_STYLES = {
  ethernet: { stroke: '#64748b', strokeWidth: 2, strokeDasharray: '0' },
  serial: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
  fiber: { stroke: '#8b5cf6', strokeWidth: 3, strokeDasharray: '0' },
};

interface CustomNodeData {
  device: Device;
  interfaces: Array<{ name: string; ip?: string; network?: string }>;
}

interface CustomEdgeData {
  link: Link;
}

const DeviceNode = ({ data, selected, onClick }: NodeProps<CustomNodeData>) => {
  const { device, interfaces } = data;
  const style = DEVICE_COLORS[device.type] || DEVICE_COLORS.router;

  return (
    <div
      className="min-w-[180px]"
      onClick={onClick}
      style={{
        border: selected ? `2px solid ${style.border}` : `1px solid ${style.border}`,
        borderRadius: '12px',
        backgroundColor: style.bg,
        color: style.text,
        boxShadow: selected ? '0 10px 25px -5px rgba(0,0,0,0.2)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}
    >
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            {device.type === 'router' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
            {device.type === 'switch' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {device.type === 'pc' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            )}
            {device.type === 'server' && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2 4h.01M17 16h.01" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{device.hostname}</h3>
            <p className="text-xs opacity-80 capitalize">{device.type}</p>
          </div>
        </div>

        {device.managementIp && (
          <p className="text-xs mb-2 font-mono bg-white/10 px-2 py-1 rounded">
            Mgmt: {device.managementIp}
          </p>
        )}

        {interfaces.length > 0 && (
          <div className="border-t border-white/20 pt-2">
            <p className="text-xs font-medium mb-1 opacity-80">Interfaces</p>
            <ul className="space-y-1 text-xs font-mono">
              {interfaces.map((iface) => (
                <li key={iface.name} className="flex items-center justify-between gap-2">
                  <span className="opacity-80">{iface.name}</span>
                  {iface.ip && <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{iface.ip}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-white/30 border-2 border-white" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-white/30 border-2 border-white" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-white/30 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-white/30 border-2 border-white" />
    </div>
  );
};

const LinkEdge = ({ data, selected }: EdgeProps<CustomEdgeData>) => {
  const { link } = data;
  const style = MEDIUM_STYLES[link.medium] || MEDIUM_STYLES.ethernet;

  return (
    <>
      <path
        stroke={selected ? '#2563eb' : style.stroke}
        strokeWidth={selected ? 3 : style.strokeWidth}
        strokeDasharray={style.strokeDasharray}
        fill="none"
        style={{ filter: selected ? 'drop-shadow(0 0 4px #2563eb)' : 'none' }}
      />
      {selected && (
        <text
          x="50%"
          y="-10"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="#2563eb"
          fontWeight="600"
          paintOrder="stroke"
          stroke="white"
          strokeWidth="3"
        >
          {link.networkCidr}
        </text>
      )}
    </>
  );
};

const Legend = ({ design }: { design: NetworkDesign }) => {
  const deviceTypes = [...new Set(design.devices.map((d) => d.type))];
  const mediumTypes = [...new Set(design.links.map((l) => l.medium))];

  return (
    <Panel position="bottom-right" className="p-4 bg-white/95 backdrop-blur rounded-xl border border-slate-200 shadow-lg min-w-[200px]">
      <h4 className="font-semibold text-slate-900 mb-3">Legend</h4>
      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Devices</p>
          <div className="space-y-1.5">
            {deviceTypes.map((type) => {
              const style = DEVICE_COLORS[type as keyof typeof DEVICE_COLORS];
              return (
                <div key={type} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: style.bg }} />
                  <span className="text-sm text-slate-700 capitalize">{type}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Links</p>
          <div className="space-y-1.5">
            {mediumTypes.map((medium) => {
              const style = MEDIUM_STYLES[medium as keyof typeof MEDIUM_STYLES];
              return (
                <div key={medium} className="flex items-center gap-2">
                  <div className="w-6 h-1 rounded" style={{ backgroundColor: style.stroke, border: `${style.strokeWidth}px solid ${style.stroke}` }} />
                  <span className="text-sm text-slate-700 capitalize">{medium}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export const Topology: React.FC = () => {
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<CustomNodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<CustomEdgeData | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge<CustomEdgeData>>([]);

  const fetchTopology = useCallback(async () => {
    try {
      setLoading(true);
      const designData = await designsApi.list().then((d) => d[0]);

      if (!designData) return;

      setDesign(designData);

      const deviceInterfaces = designData.interfaces.reduce((acc, iface) => {
        if (!acc[iface.deviceId]) acc[iface.deviceId] = [];
        acc[iface.deviceId].push({
          name: iface.interfaceName,
          ip: iface.ipAddress,
          network: iface.networkCidr,
        });
        return acc;
      }, {} as Record<string, Array<{ name: string; ip?: string; network?: string }>>);

      const initialNodes: Node<CustomNodeData>[] = designData.devices.map((device) => ({
        id: device.deviceId,
        type: 'custom',
        position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
        data: {
          device,
          interfaces: deviceInterfaces[device.deviceId] || [],
        },
      }));

      const initialEdges: Edge<CustomEdgeData>[] = designData.links.map((link) => ({
        id: link.linkId,
        source: link.sourceDeviceId,
        target: link.targetDeviceId,
        type: 'custom',
        data: { link },
        label: link.networkCidr,
        labelStyle: { fontSize: 10, fill: '#64748b', fontWeight: 500 },
        labelBgStyle: { fill: 'white', fillOpacity: 0.9, padding: 2, borderRadius: 4 },
        style: MEDIUM_STYLES[link.medium],
      }));

      setNodes(initialNodes);
      setEdges(initialEdges);
    } catch (err) {
      console.error('Failed to load topology:', err);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges]);

  useEffect(() => {
    fetchTopology();
  }, [fetchTopology]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node<CustomNodeData>) => {
      setSelectedNode(node.data);
      setSelectedEdge(null);
    },
    []
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge<CustomEdgeData>) => {
      setSelectedEdge(edge.data);
      setSelectedNode(null);
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!design) {
    return (
      <Card className="h-[calc(100vh-200px)] flex items-center justify-center">
        <p className="text-slate-500">No design loaded</p>
      </Card>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] rounded-xl border border-slate-200 overflow-hidden bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onClick={onPaneClick}
        nodeTypes={{ custom: DeviceNode }}
        edgeTypes={{ custom: LinkEdge }}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => DEVICE_COLORS[(node.data as CustomNodeData)?.device?.type as keyof typeof DEVICE_COLORS]?.bg || '#64748b'}
          maskColor="rgba(255,255,255,0.8)"
        />
        <Legend design={design} />
      </ReactFlow>

      {(selectedNode || selectedEdge) && (
        <Panel position="right" className="w-80 bg-white border-l border-slate-200 p-4 overflow-y-auto">
          {selectedNode && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Node Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Hostname</p>
                  <p className="font-medium text-slate-900">{selectedNode.device.hostname}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Type</p>
                  <p className="capitalize text-slate-700">{selectedNode.device.type}</p>
                </div>
                {selectedNode.device.model && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Model</p>
                    <p className="text-slate-700">{selectedNode.device.model}</p>
                  </div>
                )}
                {selectedNode.device.managementIp && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Management IP</p>
                    <p className="font-mono text-sm text-slate-700">{selectedNode.device.managementIp}</p>
                  </div>
                )}
                {selectedNode.interfaces.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Interfaces</p>
                    <div className="space-y-2">
                      {selectedNode.interfaces.map((iface) => (
                        <div key={iface.name} className="p-2 bg-slate-50 rounded-lg text-sm">
                          <p className="font-mono text-slate-900">{iface.name}</p>
                          {iface.ip && <p className="font-mono text-blue-600">{iface.ip}</p>}
                          {iface.network && <p className="text-xs text-slate-500">{iface.network}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedEdge && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Link Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Network</p>
                  <p className="font-mono text-sm text-slate-900">{selectedEdge.link.networkCidr}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Medium</p>
                  <p className="capitalize text-slate-700">{selectedEdge.link.medium}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Source</p>
                  <p className="text-slate-700">{selectedEdge.link.sourceDeviceId} / {selectedEdge.link.sourceInterface}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Target</p>
                  <p className="text-slate-700">{selectedEdge.link.targetDeviceId} / {selectedEdge.link.targetInterface}</p>
                </div>
              </div>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
};