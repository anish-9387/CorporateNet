import React, { useState } from 'react';
import { Card, Badge, Input, Button } from '@/components/common';
import { labDevices, deviceExplanations, labInterfaces, labLinks, type LabDevice } from '@/data/labData';

const deviceCategories = [
  { key: 'core', label: 'Core Infrastructure', ids: ['core', 'servers', 'west', 'east', 'edge', 'isp'] },
  { key: 'servers', label: 'Servers', ids: ['server1', 'server2', 'server3', 'server4'] },
  { key: 'wireless', label: 'Wireless Controllers & APs', ids: ['wlc0', 'wlc1', 'lwap0', 'lwap1', 'ap0', 'ap1', 'wrt0', 'wrt1'] },
  { key: 'access', label: 'Access Switches', ids: ['sw0', 'sw1', 'sw2', 'sw5', 'sw6', 'sw7', 'sw3'] },
  { key: 'endpoints', label: 'End Devices', ids: ['pc0', 'pc5', 'laptop0', 'laptop1', 'laptop2', 'laptop3', 'pc1', 'pc3', 'pc4', 'pc2', 'pc2b', 'laptop4', 'laptop5', 'laptop6', 'laptop7', 'laptop8', 'laptop9', 'laptop10'] },
] as const;

function typeColor(type: LabDevice['type']) {
  const colors: Record<LabDevice['type'], string> = {
    router: 'bg-blue-100 text-blue-800',
    switch: 'bg-purple-100 text-purple-800',
    server: 'bg-green-100 text-green-800',
    pc: 'bg-slate-100 text-slate-800',
    laptop: 'bg-orange-100 text-orange-800',
    wireless: 'bg-pink-100 text-pink-800',
    controller: 'bg-indigo-100 text-indigo-800',
  };
  return colors[type] || 'bg-slate-100 text-slate-800';
}

function getDeviceInterfaces(deviceId: string) {
  return labInterfaces.filter((iface) => iface.deviceId === deviceId);
}

function getDeviceLinks(deviceId: string) {
  return labLinks.filter((link) => link.sourceDeviceId === deviceId || link.targetDeviceId === deviceId);
}

export const DeviceGuide: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | string>('all');
  const [selectedDevice, setSelectedDevice] = useState<LabDevice | null>(null);

  const filteredDevices = labDevices.filter((device) => {
    const matchesSearch = device.name.toLowerCase().includes(search.toLowerCase()) ||
      (device.description?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      device.type.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      deviceCategories.find(c => c.key === selectedCategory)?.ids.some((id) => id === device.id);
    return matchesSearch && matchesCategory;
  });
  const selectedInterfaces = selectedDevice ? getDeviceInterfaces(selectedDevice.id) : [];
  const selectedLinks = selectedDevice ? getDeviceLinks(selectedDevice.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">DEVICE REFERENCE GUIDE</p>
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">{labDevices.length} devices — purpose and roles</h2>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Every device in the topology with its role, why it was chosen, and what it represents in the architecture.
          Click any device to see detailed explanations, interfaces, and connections.
        </p>
      </div>

      <Card>
        <div className="card-body space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <Input
                placeholder="Search devices by name, type, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant={selectedCategory === 'all' ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedCategory('all')}>All</Button>
              {deviceCategories.map((cat) => (
                <Button key={cat.key} variant={selectedCategory === cat.key ? 'primary' : 'secondary'} size="sm" onClick={() => setSelectedCategory(cat.key)}>
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-500">{filteredDevices.length} of {labDevices.length} devices shown</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((device) => {
          const explanation = deviceExplanations[device.id];
          return (
            <button key={device.id} type="button" className="text-left" onClick={() => setSelectedDevice(selectedDevice?.id === device.id ? null : device)}>
            <Card className={`h-full cursor-pointer transition-shadow hover:shadow-lg ${selectedDevice?.id === device.id ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="card-body p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${typeColor(device.type)}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        {device.type === 'server' && <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h10M7 14h2m3 0h2m3 0h1" /></>}
                        {device.type === 'router' && <><rect x="2" y="5" width="20" height="14" rx="6" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
                        {(device.type === 'switch') && <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
                        {(device.type === 'pc' || device.type === 'laptop') && <><rect x="4" y="3" width="16" height="13" rx="2" /><path d={device.type === 'laptop' ? 'M4 16l-2 5h20l-2-5' : 'M12 16v5m-5 0h10'} /></>}
                        {(device.type === 'wireless' || device.type === 'controller') && <><rect x="5" y="15" width="14" height="6" rx="2" /><path d="M12 15V9M8 11a6 6 0 018 0M5 7a10 10 0 0114 0" /></>}
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{device.name}</h4>
                      <p className="text-xs text-slate-500">{device.model ?? 'Network device'}</p>
                    </div>
                  </div>
                  <Badge variant="neutral" className={typeColor(device.type)}>{device.type}</Badge>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2">{device.description}</p>
                {explanation && (
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                    <p className="text-slate-500"><strong>Role:</strong> {explanation.role}</p>
                  </div>
                )}
              </div>
            </Card>
            </button>
          );
        })}
      </div>

      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedDevice(null)}>
          <div className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
          <Card className="max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColor(selectedDevice.type)}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    {selectedDevice.type === 'server' && <><rect x="3" y="6" width="18" height="12" rx="3" /><path d="M7 10h10M7 14h2m3 0h2m3 0h1" /></>}
                    {selectedDevice.type === 'router' && <><rect x="2" y="5" width="20" height="14" rx="6" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
                    {(selectedDevice.type === 'switch') && <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M6 10h12M6 14h2m3 0h2m3 0h2" /></>}
                    {(selectedDevice.type === 'pc' || selectedDevice.type === 'laptop') && <><rect x="4" y="3" width="16" height="13" rx="2" /><path d={selectedDevice.type === 'laptop' ? 'M4 16l-2 5h20l-2-5' : 'M12 16v5m-5 0h10'} /></>}
                    {(selectedDevice.type === 'wireless' || selectedDevice.type === 'controller') && <><rect x="5" y="15" width="14" height="6" rx="2" /><path d="M12 15V9M8 11a6 6 0 018 0M5 7a10 10 0 0114 0" /></>}
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedDevice.name}</h3>
                  <p className="text-sm text-slate-500">{selectedDevice.model ?? 'Network device'} · {selectedDevice.type}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Description</h4>
                <p className="text-slate-700">{selectedDevice.description}</p>
              </div>
              
              {deviceExplanations[selectedDevice.id] && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-medium text-slate-900">Why This Device?</h4>
                  {(() => {
                    const exp = deviceExplanations[selectedDevice.id];
                    return (
                      <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-slate-700">Purpose</dt>
                      <dd className="text-slate-600 mt-1">{exp.purpose}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700">Why Chosen</dt>
                      <dd className="text-slate-600 mt-1">{exp.whyChosen}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-700">Role in Architecture</dt>
                      <dd className="text-slate-600 mt-1">{exp.role}</dd>
                    </div>
                  </dl>
                );
              })()}
                </div>
              )}

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Interfaces</h4>
                {selectedInterfaces.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInterfaces.map((iface) => (
                      <div key={iface.interfaceName} className="flex flex-wrap gap-2 text-sm">
                        <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{iface.interfaceName}</code>
                        {iface.ipAddress && <code className="bg-blue-50 px-2 py-1 rounded font-mono text-xs text-blue-700">{iface.ipAddress}</code>}
                        {iface.networkCidr && <span className="text-slate-500 font-mono text-xs">{iface.networkCidr}</span>}
                        {iface.passiveOspf && <Badge variant="info" className="text-xs">OSPF Passive</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No interfaces configured</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Connections</h4>
                {selectedLinks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLinks.map((link) => {
                      const isSource = link.sourceDeviceId === selectedDevice.id;
                      const peerId = isSource ? link.targetDeviceId : link.sourceDeviceId;
                      const peer = labDevices.find(d => d.id === peerId);
                      const localIface = isSource ? link.sourceInterface : link.targetInterface;
                      const remoteIface = isSource ? link.targetInterface : link.sourceInterface;
                      return (
                        <div key={link.linkId} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{localIface}</code>
                            <span className="text-slate-400">↔</span>
                            <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">{remoteIface}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            {peer && <span className="font-medium text-slate-700">{peer.name}</span>}
                            {link.networkCidr && <code className="font-mono text-xs text-slate-500">{link.networkCidr}</code>}
                            <Badge variant="neutral" className="text-xs capitalize">{link.medium}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No connections</p>
                )}
              </div>
            </div>
          </Card>
          </div>
        </div>
      )}
    </div>
  );
};
