import { Link } from 'react-router-dom';
import topologyImage from '../../../docs/assets/scalable-corporate-network-topology.png';

const layers = [
  ['Access', 'Where users connect', 'Department switches connect wired PCs. Access points bridge wireless laptops onto the same department LAN. Controllers manage the lightweight access points.'],
  ['Distribution', 'Where departments meet', 'Multilayer Switch1 serves Engineering, Administration and HR. Multilayer Switch3 serves Finance and IT. These provide the gateways and DHCP services for their departments.'],
  ['Core', 'The shared backbone', 'Multilayer Switch2 connects distribution, the server switch and Router0. OSPF area 0 shares routes between these routing devices.'],
  ['Edge & services', 'Where the packet arrives', 'The server segment supplies DNS and web services. Router0 connects to the simulated ISP and performs NAT/PAT for matching outbound traffic.'],
];

export function Architecture() {
  return <div className="overview-story">
    <div><p className="eyebrow">NETWORK DESIGN</p><h2 className="text-3xl font-medium tracking-tight mt-3">Built in layers. Easy to extend.</h2><p className="project-intro mt-4">Each layer has a clear job. Follow the path from a user's device to another department, a shared server or the ISP.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{layers.map(([layer,title,description],i)=><section key={layer} className="explain-panel"><p className="eyebrow">0{i+1} · {layer}</p><h3 className="text-xl font-medium tracking-tight my-4">{title}</h3><p className="text-sm text-slate-600 leading-relaxed">{description}</p></section>)}</div>
    <figure className="explain-panel"><img src={topologyImage} alt="Scalable Corporate Network in Packet Tracer showing department access networks, the core, shared servers and the ISP" className="w-full h-auto" /><figcaption className="text-sm text-slate-600 mt-4">The actual project topology. The browser simulation explains these connections; Packet Tracer runs the protocols.</figcaption></figure>
    <section className="explain-panel"><div className="section-heading"><div><p className="eyebrow">SCALABILITY</p><h3>Adding another department.</h3></div><Link to="/vlsm">Try the address calculator →</Link></div><p className="text-slate-600 leading-relaxed">Allocate an unused subnet, connect a new access switch to distribution, configure its gateway and DHCP pool, then advertise the subnet through OSPF. Check available addresses, switch ports and uplink capacity as the company grows.</p></section>
    <section className="explain-panel"><p className="eyebrow">RESILIENCE</p><h3 className="text-xl font-medium my-4">An alternative route to the servers.</h3><p className="text-slate-600 leading-relaxed">Two routed links connect the core and server switch. OSPF can use an available route if one of those links fails. This protects that connection; the rest of the design still has individual devices and links that could interrupt service.</p></section>
    <p className="lab-disclaimer">The ISP and public server are simulated inside Packet Tracer. This project does not connect to the real Internet.</p>
  </div>;
}
