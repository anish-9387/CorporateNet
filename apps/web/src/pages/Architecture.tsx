import React from 'react';
import { Card, CardHeader } from '@/components/common';
import { architectureSections } from '@/data/labData';

export const Architecture: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <p className="eyebrow mb-2">NETWORK DESIGN DOCUMENTATION</p>
        <h2 className="text-3xl font-medium tracking-tight text-slate-900">Scalable Corporate Network Architecture</h2>
        <p className="text-slate-500 mt-2 max-w-3xl">
          Complete architecture documentation for the 43-device Packet Tracer lab. 
          Covers addressing, routing, wireless, NAT, redundancy, and verification.
        </p>
      </div>

      <div className="space-y-4">
        {architectureSections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
            </CardHeader>
            <div className="card-body prose prose-slate max-w-none">
              {section.content.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line.startsWith('|') ? (
                    <div key={i} className="overflow-x-auto my-3">
                      <table className="min-w-full divide-y divide-slate-200">
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 text-sm font-mono text-slate-700 whitespace-pre">{line}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : line.startsWith('**') && line.endsWith('**') ? (
                    <h4 key={i} className="mt-4 mb-2 font-semibold text-slate-900">{line.replace(/\*\*/g, '')}</h4>
                  ) : line.startsWith('* ') || line.startsWith('- ') ? (
                    <li key={i} className="ml-6 list-disc text-slate-700">{line.slice(2)}</li>
                  ) : line.trim() === '' ? (
                    <br key={i} />
                  ) : (
                    <p key={i} className="text-slate-700 whitespace-pre-wrap">{line}</p>
                  )}
                </React.Fragment>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-green-300 bg-green-50">
        <CardHeader>
          <h3 className="text-lg font-semibold text-green-900">Lab Verification Status</h3>
        </CardHeader>
        <div className="card-body space-y-3 text-green-800">
          <p><strong>Verified samples:</strong> Cross-subnet ICMP, switch management reachability, ISP access, OSPF server-link failover, NAT/PAT, and managed wireless DHCP.</p>
          <p><strong>Audit scope:</strong> The pair matrix is tracked separately; pairs involving a Layer-2 AP without an IP address are not valid ICMP source tests and must be verified through associated clients.</p>
          <p><strong>📍 Addresses:</strong> All corporate addresses from 10.10.0.0/23. External addresses are TEST-NET (RFC 5737) — not real Internet allocations.</p>
          <p><strong>🔄 Convergence:</strong> First packet after reopen may fail (ARP/OSPF). Allow convergence and retry.</p>
          <p><strong>📦 Packet Tracer:</strong> Open <code className="font-mono bg-green-100 px-1.5 py-0.5 rounded">Scalable_Corporate_Network_CN.pkt</code> in Packet Tracer 9.0.1+</p>
        </div>
      </Card>
    </div>
  );
};
