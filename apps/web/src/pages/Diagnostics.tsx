import React, { useEffect, useState } from 'react';
import { designsApi, testsApi } from '../../api';
import { NetworkDesign, TestRun, TestStatus, EvidenceType, ConnectivityMatrix } from '../../types';
import { Card, CardHeader, Badge, StatusBadge, Table, Button, Input } from '../../components/common';

const testTypes = ['ping', 'traceroute', 'interface-status', 'ospf-neighbor', 'ospf-route', 'dhcp-lease', 'dhcp-pool'] as const;
const statuses: TestStatus[] = ['passed', 'failed', 'not-run', 'not-applicable'];
const evidenceTypes: EvidenceType[] = ['packet-tracer-cli', 'packet-tracer-ping', 'manual', 'simulated'];

const defaultTests = [
  { source: '10.10.0.10', destination: '10.10.0.130', testType: 'ping' as const, description: 'Engineering → Admin' },
  { source: '10.10.0.10', destination: '10.10.0.193', testType: 'ping' as const, description: 'Engineering → Finance' },
  { source: '10.10.0.10', destination: '10.10.0.225', testType: 'ping' as const, description: 'Engineering → HR' },
  { source: '10.10.0.10', destination: '10.10.1.2', testType: 'ping' as const, description: 'Engineering → IT Support' },
  { source: '10.10.0.130', destination: '10.10.0.193', testType: 'ping' as const, description: 'Admin → Finance' },
  { source: '10.10.0.130', destination: '10.10.0.225', testType: 'ping' as const, description: 'Admin → HR' },
  { source: '10.10.0.130', destination: '10.10.1.2', testType: 'ping' as const, description: 'Admin → IT Support' },
  { source: '10.10.0.193', destination: '10.10.0.225', testType: 'ping' as const, description: 'Finance → HR' },
  { source: '10.10.0.193', destination: '10.10.1.2', testType: 'ping' as const, description: 'Finance → IT Support' },
  { source: '10.10.0.225', destination: '10.10.1.2', testType: 'ping' as const, description: 'HR → IT Support' },
  { source: 'R1', destination: 'R2', testType: 'ospf-neighbor' as const, description: 'R1-R2 OSPF Adjacency' },
  { source: 'R2', destination: 'R3', testType: 'ospf-neighbor' as const, description: 'R2-R3 OSPF Adjacency' },
  { source: 'R1', destination: 'G0/0', testType: 'interface-status' as const, description: 'R1 G0/0 (Engineering)' },
  { source: 'R1', destination: 'G0/1', testType: 'interface-status' as const, description: 'R1 G0/1 (Admin)' },
  { source: 'R2', destination: 'G0/0', testType: 'interface-status' as const, description: 'R2 G0/0 (Finance)' },
  { source: 'R2', destination: 'G0/1', testType: 'interface-status' as const, description: 'R2 G0/1 (HR)' },
  { source: 'R3', destination: 'G0/0', testType: 'interface-status' as const, description: 'R3 G0/0 (IT Support)' },
];

export const Diagnostics: React.FC = () => {
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [tests, setTests] = useState<TestRun[]>([]);
  const [matrix, setMatrix] = useState<ConnectivityMatrix>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const designs = await designsApi.list();
        if (designs.length > 0) {
          const d = designs[0];
          setDesign(d);
          const [testsRes, matrixRes] = await Promise.all([
            testsApi.list({ designId: d._id }),
            testsApi.getMatrix(d._id),
          ]);
          setTests(testsRes.tests);
          setMatrix(matrixRes);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load diagnostics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTestStatus = (source: string, destination: string): TestStatus => {
    return matrix[source]?.[destination] ?? 'not-run';
  };

  const saveTest = async (index: number, status: TestStatus, evidenceType: EvidenceType, notes: string) => {
    if (!design) return;
    const test = defaultTests[index];
    try {
      setSaving(`${test.source}-${test.destination}`);
      await testsApi.create({
        designId: design._id,
        testType: test.testType,
        source: test.source,
        destination: test.destination,
        status,
        evidenceType,
        notes,
      });
      setTests((prev) => [...prev, { designId: design._id, testType: test.testType, source: test.source, destination: test.destination, status, evidenceType, notes, testedAt: new Date().toISOString(), _id: '', createdAt: '', updatedAt: '' }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save test');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (error) {
    return <Card><div className="p-6 text-center text-red-600">Error: {error}</div></Card>;
  }

  if (!design) {
    return <Card><div className="p-6 text-center text-slate-500">No design loaded</div></Card>;
  }

  const passedCount = tests.filter((t) => t.status === 'passed').length;
  const failedCount = tests.filter((t) => t.status === 'failed').length;
  const notRunCount = defaultTests.length - tests.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Tests</p>
            <p className="text-3xl font-bold text-slate-900">{defaultTests.length}</p>
          </div>
        </Card>
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Passed</p>
            <p className="text-3xl font-bold text-green-600">{passedCount}</p>
          </div>
        </Card>
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Failed</p>
            <p className="text-3xl font-bold text-red-600">{failedCount}</p>
          </div>
        </Card>
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Not Run</p>
            <p className="text-3xl font-bold text-slate-500">{notRunCount}</p>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Connectivity Matrix</h2>
          <Badge variant="info">Source → Destination</Badge>
        </CardHeader>
        <div className="card-body p-0 overflow-x-auto">
          <table className="w-full table">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">Source</th>
                {design.departments.map((dept) => (
                  <th key={dept.name} className="px-3 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                    {dept.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {design.departments.map((sourceDept) => (
                <tr key={sourceDept.name} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-900 sticky left-0 bg-white z-10">{sourceDept.name}</td>
                  {design.departments.map((destDept) => {
                    const status = getTestStatus(sourceDept.name, destDept.name);
                    if (sourceDept.name === destDept.name) {
                      return <td key={destDept.name} className="px-3 py-2 text-center text-slate-300">—</td>;
                    }
                    return (
                      <td key={destDept.name} className="px-3 py-2 text-center">
                        <StatusBadge status={status} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Test Checklist</h2>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => defaultTests.forEach((t, i) => saveTest(i, 'passed', 'manual', 'Bulk pass'))}>
              Mark All Passed
            </Button>
            <Button variant="secondary" size="sm" onClick={() => defaultTests.forEach((t, i) => saveTest(i, 'not-run', 'manual', 'Bulk reset'))}>
              Reset All
            </Button>
          </div>
        </CardHeader>
        <div className="card-body p-0">
          <div className="divide-y divide-slate-100">
            {defaultTests.map((test, index) => {
              const existingTest = tests.find((t) => t.source === test.source && t.destination === test.destination && t.testType === test.testType);
              const currentStatus = existingTest?.status ?? 'not-run';
              const currentEvidence = existingTest?.evidenceType ?? 'manual';
              const currentNotes = existingTest?.notes ?? '';

              return (
                <div key={index} className="p-4 flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-slate-900">{test.description}</span>
                      <Badge variant="neutral" className="font-mono text-xs">{test.testType}</Badge>
                    </div>
                    <div className="text-sm text-slate-500 mt-1 font-mono">{test.source} → {test.destination}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <select
                      value={currentStatus}
                      onChange={(e) => saveTest(index, e.target.value as TestStatus, currentEvidence, currentNotes)}
                      className="input input-sm w-32"
                      disabled={saving === `${test.source}-${test.destination}`}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                      value={currentEvidence}
                      onChange={(e) => saveTest(index, currentStatus, e.target.value as EvidenceType, currentNotes)}
                      className="input input-sm w-40"
                      disabled={saving === `${test.source}-${test.destination}`}
                    >
                      {evidenceTypes.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <Input
                      value={currentNotes}
                      onChange={(e) => saveTest(index, currentStatus, currentEvidence, e.target.value)}
                      placeholder="Notes..."
                      className="w-48"
                      disabled={saving === `${test.source}-${test.destination}`}
                    />
                    {saving === `${test.source}-${test.destination}` && (
                      <div className="spinner" aria-label="Saving" />
                    )}
                    {existingTest && (
                      <Badge variant="success">Saved</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">Additional Validation Commands</h2>
        </CardHeader>
        <div className="card-body space-y-3">
          {[
            { cmd: 'show ip interface brief', desc: 'Verify all interface IP addresses and status' },
            { cmd: 'show ip ospf neighbor', desc: 'Confirm OSPF adjacencies are FULL' },
            { cmd: 'show ip route ospf', desc: 'Validate OSPF-learned routes in table' },
            { cmd: 'show ip dhcp binding', desc: 'Check DHCP lease assignments' },
            { cmd: 'show ip dhcp pool', desc: 'Verify DHCP pool configuration' },
            { cmd: 'ping <remote-PC-IP>', desc: 'Test cross-department connectivity' },
            { cmd: 'tracert <remote-PC-IP>', desc: 'Verify routing path (from PC)' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <code className="font-mono text-sm bg-white px-2 py-1 rounded border">{item.cmd}</code>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
              <Badge variant="neutral">Manual</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};