import type { Link, NetworkDesign } from '@/types';

export function findPath(links: Link[], source: string, destination: string, failedLink = ''): string[] | null {
  if (!source || !destination) return null;
  const queue = [{ device: source, path: [] as string[] }];
  const visited = new Set([source]);
  for (const current of queue) {
    if (current.device === destination) return current.path;
    for (const link of links) {
      if (link.linkId === failedLink) continue;
      const next = link.sourceDeviceId === current.device ? link.targetDeviceId : link.targetDeviceId === current.device ? link.sourceDeviceId : null;
      if (next && !visited.has(next)) {
        visited.add(next);
        queue.push({ device: next, path: [...current.path, link.linkId] });
      }
    }
  }
  return null;
}

export function layoutDevices(design: NetworkDesign) {
  const routers = design.devices.filter((device) => device.type === 'router');
  const rows = new Map<number, number>();
  return design.devices.map((device, index) => {
    const routerIndex = routers.findIndex((router) => router.deviceId === device.deviceId);
    if (routerIndex >= 0) return { device, position: { x: routerIndex * 320, y: 50 } };
    const link = design.links.find((item) => item.sourceDeviceId === device.deviceId || item.targetDeviceId === device.deviceId);
    const parent = routers.findIndex((router) => router.deviceId === link?.sourceDeviceId || router.deviceId === link?.targetDeviceId);
    const column = parent >= 0 ? parent : index;
    const row = rows.get(column) ?? 0;
    rows.set(column, row + 1);
    return { device, position: { x: column * 320, y: 240 + row * 145 } };
  });
}
