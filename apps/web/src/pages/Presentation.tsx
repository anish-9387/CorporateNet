import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, Handle, Position, BaseEdge, getBezierPath, type Node, type NodeProps, type Edge, type EdgeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/common';
import { 
  labDevices, 
  labLinks, 
  labSubnets, 
  demoSteps, 
  stepRoute, 
  stepTicks, 
  demoTickMs, 
  type LabDevice,
  devicePositions
} from '@/data/labData';

type LabNode = Node<{ device: LabDevice; active: boolean }>;
type LabEdge = Edge<{ moving: boolean; paused: boolean; secondary: boolean; packetKey: string }>;

function LabIcon({ kind }: { kind: LabDevice['type'] }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      {kind === 'server' ? (
        <>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M5 8h14M5 15h14M8 5h1m-1 7h1m-1 6h1" />
        </>
      ) : kind === 'wireless' || kind === 'controller' ? (
        <>
          <rect x="5" y="15" width="14" height="6" rx="2" />
          <path d="M12 15V9M8 11a6 6 0 018 0M5 7a10 10 0 0114 0" />
        </>
      ) : kind === 'pc' || kind === 'laptop' ? (
        <>
          <rect x="4" y="3" width="16" height="13" rx="2" />
          <path d={kind === 'laptop' ? 'M4 16l-2 5h20l-2-5' : 'M12 16v5m-5 0h10'} />
        </>
      ) : (
        <>
          <rect x="2" y="5" width="20" height="14" rx={kind === 'router' ? 6 : 2} />
          <path d="M6 10h12M6 14h2m3 0h2m3 0h2" />
        </>
      )}
    </svg>
  );
}

function PresentationDevice({ data, selected }: NodeProps<LabNode>) {
  return (
    <div className={`lab-device ${data.active ? 'is-active' : ''} ${selected ? 'is-selected' : ''}`}>
      <Handle id="in" type="target" position={Position.Top} />
      <LabIcon kind={data.device.type} />
      <strong>{data.device.name}</strong>
      <span>{data.device.managementIp || data.device.model || 'DHCP / bridge'}</span>
      <Handle id="out" type="source" position={Position.Bottom} />
    </div>
  );
}

function PresentationEdge(props: EdgeProps<LabEdge>) {
  const [path] = getBezierPath({ ...props, curvature: props.data?.secondary ? .8 : .22 });
  return (
    <>
      <BaseEdge id={props.id} path={path} style={props.style} />
      {props.data?.moving && (
        <circle 
          key={props.data.packetKey} 
          r="6" 
          fill="#18181b" 
          className="lab-packet" 
          style={{ 
            offsetPath: `path('${path}')`, 
            animationPlayState: props.data.paused ? 'paused' : 'running' 
          }} 
        />
      )}
    </>
  );
}

const nodeTypes = { lab: PresentationDevice };
const edgeTypes = { lab: PresentationEdge };

export function Presentation() {
  const [stepIndex, setStepIndex] = useState(-1);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [wide, setWide] = useState(false);
  const [selected, setSelected] = useState<LabDevice | null>(null);
  const complete = stepIndex === demoSteps.length;
  const step = demoSteps[stepIndex];
  const route = useMemo(() => step ? stepRoute(step) ?? [] : [], [step]);
  const currentLink = route[tick];

  useEffect(() => {
    if (!running || !step) return;
    const timer = window.setTimeout(() => {
      if (tick + 1 < stepTicks(step)) setTick(tick + 1);
      else {
        setStepIndex(stepIndex + 1);
        setTick(0);
        if (stepIndex + 1 === demoSteps.length) setRunning(false);
      }
    }, demoTickMs);
    return () => window.clearTimeout(timer);
  }, [running, step, stepIndex, tick]);

  useEffect(() => {
    if (!wide) return;
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setWide(false); };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [wide]);

  const activeDevices = new Set<string>();
  const highlighted = step?.highlights ?? route;
  for (const link of labLinks) if (highlighted.includes(link.linkId)) {
    activeDevices.add(link.sourceDeviceId); activeDevices.add(link.targetDeviceId);
  }
  
  const nodes: LabNode[] = labDevices.map((device) => ({ 
    id: device.id, 
    type: 'lab', 
    position: devicePositions[device.id], 
    data: { device, active: activeDevices.has(device.id) } 
  }));
  
  const edges: LabEdge[] = labLinks.map((link) => {
    let from = step?.from;
    for (const id of route) {
      if (id === link.linkId) break;
      const previous = labLinks.find((item) => item.linkId === id)!;
      from = previous.sourceDeviceId === from ? previous.targetDeviceId : previous.sourceDeviceId;
    }
    const reversed = route.includes(link.linkId) && from !== link.sourceDeviceId;
    const failed = step?.failedLink === link.linkId;
    const active = highlighted.includes(link.linkId);
    return {
      id: link.linkId, 
      type: 'lab', 
      source: reversed ? link.targetDeviceId : link.sourceDeviceId, 
      target: reversed ? link.sourceDeviceId : link.targetDeviceId,
      data: { 
        moving: currentLink === link.linkId, 
        paused: !running, 
        secondary: link.linkId === 'server-backup', 
        packetKey: `${stepIndex}:${tick}` 
      },
      style: { 
        stroke: failed ? '#dc2626' : active ? '#3f3f46' : '#c7c9cf', 
        strokeWidth: failed || active ? 3 : 1.5, 
        strokeDasharray: failed ? '9 5' : link.medium === 'wireless' ? '3 5' : undefined 
      },
    };
  });
  
  const start = () => { setTick(0); setStepIndex(0); setRunning(true); setSelected(null); };
  const progress = complete ? 100 : step ? ((stepIndex + tick / stepTicks(step)) / demoSteps.length) * 100 : 0;

  return (
    <div className={`presentation ${wide ? 'presentation-wide' : ''}`}>
      <div className="presentation-heading">
        <div>
          <p className="eyebrow">PACKET TRACER COMPANION · 43 DEVICES</p>
          <h2>Scalable Corporate Network</h2>
          <p>VLSM, subnetting, OSPF & DHCP — one guided demonstration.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button onClick={start}>{complete ? 'Replay simulation' : 'Simulate'}</Button>
          {step && <Button variant="secondary" onClick={() => setRunning(!running)}>{running ? 'Pause' : 'Resume'}</Button>}
          <Button variant="secondary" onClick={() => setWide(!wide)}>{wide ? 'Exit presentation' : 'Present'}</Button>
          {(step || complete) && <Button variant="ghost" onClick={() => { setStepIndex(-1); setTick(0); setRunning(false); }}>Reset</Button>}
        </div>
      </div>

      <div className="lab-story" role="status" aria-live="polite" aria-atomic="true">
        <div className="lab-stage">{complete ? '✓' : step ? String(stepIndex + 1).padStart(2, '0') : '▶'}</div>
        <div>
          <p className="eyebrow">{complete ? 'DEMONSTRATION COMPLETE' : step ? `${step.protocol} · ${running ? 'RUNNING' : 'PAUSED'}` : 'READY TO PRESENT · ABOUT ONE MINUTE'}</p>
          <h3>{complete ? 'Addressing, connectivity and resilience.' : step?.title ?? 'Your complete topology, ready to explain.'}</h3>
          <p>{complete ? 'The walkthrough is complete and both server links are restored. Open the completed .pkt to show protocol details and actual test results.' : step?.explanation ?? 'Click Simulate once. Follow the highlighted route and the moving packet while each stage explains what the network is doing.'}</p>
        </div>
        <span className="lab-counter">{Math.max(0, stepIndex + (complete ? 0 : 1))} / {demoSteps.length}</span>
      </div>
      <div className="lab-progress" role="progressbar" aria-label="Demonstration progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="lab-map" aria-label="Completed Packet Tracer topology: 43 devices">
        <div className="lab-map-caption">
          <span>43 devices · 43 physical / wireless connections</span>
          <span>— Wired &nbsp; ··· Wireless &nbsp; <b>●</b> Illustrated packet</span>
        </div>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          nodeTypes={nodeTypes} 
          edgeTypes={edgeTypes} 
          fitView 
          fitViewOptions={{ padding: .08 }} 
          minZoom={.2} 
          maxZoom={2} 
          nodesDraggable={false} 
          nodesConnectable={false} 
          edgesReconnectable={false} 
          onNodeClick={(_event, node) => setSelected(node.data.device)} 
          onPaneClick={() => setSelected(null)}
        >
          <Background gap={26} size={1} color="#dfe1e5" />
          <Controls showInteractive={false} />
        </ReactFlow>
        {selected && (
          <aside className="lab-inspector">
            <button aria-label="Close device details" onClick={() => setSelected(null)}>×</button>
            <p className="eyebrow">{selected.type}</p>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            {labLinks.filter((link) => link.sourceDeviceId === selected.id || link.targetDeviceId === selected.id).map((link) => (
              <p key={link.linkId} className="lab-port">
                {link.sourceDeviceId === selected.id ? link.sourceInterface : link.targetInterface} ↔ 
                {labDevices.find((item) => item.id === (link.sourceDeviceId === selected.id ? link.targetDeviceId : link.sourceDeviceId))?.name}
                {link.networkCidr ? ` · ${link.networkCidr}` : ''}
              </p>
            ))}
          </aside>
        )}
      </div>

      <div className="lab-subnets">
        {labSubnets.map((subnet) => (
          <div key={subnet.name}>
            <strong>{subnet.name}</strong>
            <code>{subnet.cidr}</code>
            <span>{subnet.hosts} required hosts · GW {subnet.gateway}</span>
          </div>
        ))}
      </div>
      <p className="lab-disclaimer">
        Educational visualization of the .pkt, transcribed manually. Client IPs are observed DHCP leases and may change; check ipconfig in Packet Tracer before testing. 
        This page does not control Packet Tracer or run live IOS, DHCP, OSPF, NAT or CAPWAP. Packet timings and route selection are illustrative.
      </p>
    </div>
  );
}
