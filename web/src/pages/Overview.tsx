import { Link } from 'react-router-dom';
import { Button } from '@/components/common';
import { labDepartments } from '@/data/labData';

const concepts = [
  ['01', 'VLSM & subnetting', 'Give each department the address space it needs, with room to grow.', '/vlsm'],
  ['02', 'OSPF routing', 'Learn routes automatically between the core and department gateways.', '/architecture'],
  ['03', 'DHCP & wireless', 'Assign addresses automatically and connect users through access points.', '/device-guide'],
  ['04', 'NAT at the edge', 'Translate corporate addresses on the way to the simulated ISP.', '/simulation'],
];

export function Overview() {
  return <div className="overview-story">
    <section className="project-hero">
      <p className="eyebrow">COMPUTER NETWORKS · PROJECT WALKTHROUGH</p>
      <h2>One company.<br />Every department connected.</h2>
      <p className="project-intro">Scalable Corporate Network connects five departments, shared servers and wireless users. Follow a packet to understand how addressing, switching and routing work together.</p>
      <div className="flex flex-wrap gap-3 mt-7"><Button size="lg" asChild><Link to="/simulation">Start simulation ↗</Link></Button><Button size="lg" variant="secondary" asChild><Link to="/topology">Explore the topology</Link></Button></div>
      <div className="project-facts"><span>5 departments</span><span>10.10.0.0/23</span><span>OSPF area 0</span></div>
    </section>
    <section className="explain-panel" aria-labelledby="path-title">
      <div className="section-heading"><div><p className="eyebrow">THE BIG PICTURE</p><h3 id="path-title">A simple path through the network.</h3></div><Link to="/architecture">Understand the design →</Link></div>
      <div className="network-sequence">{[
        ['User device', 'A PC or wireless laptop sends a packet.'],
        ['Access', 'A switch or access point connects the user.'],
        ['Distribution & core', 'The gateway routes it to the right subnet.'],
        ['Destination', 'A server, another user or the simulated ISP.'],
      ].map(([title,description],i)=><div className="sequence-step" key={title}><span className="sequence-number">0{i+1}</span><h4>{title}</h4><p>{description}</p></div>)}</div>
    </section>
    <section aria-labelledby="concepts-title"><div className="section-heading"><div><p className="eyebrow">FOUR IDEAS TO EXPLAIN</p><h3 id="concepts-title">How the design works.</h3></div></div><div className="concept-grid">{concepts.map(([number,title,description,path])=><Link className="concept-card" to={path} key={number}><span className="eyebrow">{number}</span><h4>{title}<span aria-hidden="true">↗</span></h4><p>{description}</p></Link>)}</div></section>
    <section className="explain-panel" aria-labelledby="address-title"><div className="section-heading"><div><p className="eyebrow">ADDRESS PLAN</p><h3 id="address-title">A subnet for each department.</h3></div><Link to="/vlsm">Explore VLSM →</Link></div><div className="overflow-x-auto"><table className="table"><thead><tr><th>Department</th><th>Hosts needed</th><th>Subnet</th><th>Gateway</th></tr></thead><tbody>{labDepartments.map(d=><tr key={d.name}><td>{d.name}</td><td>{d.hostRequirement}</td><td><code>{d.networkCidr}</code></td><td><code>{d.gateway}</code></td></tr>)}</tbody></table></div></section>
    <p className="lab-disclaimer">An illustrated explanation of the design. Demonstrate live protocol behaviour in Cisco Packet Tracer.</p>
  </div>;
}
