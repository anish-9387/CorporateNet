import React, { useEffect, useState } from 'react';
import { designsApi, testsApi } from '@/api';
import { NetworkDesign, TestRun, TestStatus, EvidenceType, ConnectivityMatrix } from '@/types';
import { Card, CardHeader, Badge, StatusBadge, Button, Input } from '@/components/common';

const statuses: TestStatus[] = ['passed', 'failed', 'not-run', 'not-applicable'];
const evidenceTypes: EvidenceType[] = ['packet-tracer-cli', 'packet-tracer-ping', 'manual', 'simulated'];

export const Diagnostics: React.FC = () => {
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [tests, setTests] = useState<TestRun[]>([]);
  const [matrix, setMatrix] = useState<ConnectivityMatrix>({});
  const [loading, setLoading] = useState(true);
  const [bulkSaving, setBulkSaving] = useState(false);
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
            testsApi.list({ designId: d._id, limit: 100 }),
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

  const defaultTests = design ? [
    ...design.departments.flatMap((source) => design.departments.filter((destination) => source.name !== destination.name).map((destination) => ({ source: source.name, destination: destination.name, testType: 'ping', description: `${source.name} → ${destination.name}` }))),
    ...design.links.filter((link) => link.medium === 'serial').map((link) => ({ source: link.sourceDeviceId, destination: link.targetDeviceId, testType: 'ospf-neighbor', description: `${design.devices.find((d) => d.deviceId === link.sourceDeviceId)?.hostname} ↔ ${design.devices.find((d) => d.deviceId === link.targetDeviceId)?.hostname} OSPF` })),
    ...design.interfaces.map((iface) => ({ source: iface.deviceId, destination: iface.interfaceName, testType: 'interface-status', description: `${design.devices.find((d) => d.deviceId === iface.deviceId)?.hostname} ${iface.interfaceName}` })),
  ] : [];
  const latestTest = (test: typeof defaultTests[number]) => tests.find((record) => record.source === test.source && record.destination === test.destination && record.testType === test.testType);
  const bulkSave = async (status: TestStatus) => {
    setBulkSaving(true);
    try { for (let i = 0; i < defaultTests.length; i++) await saveTest(i, status, 'manual', 'Bulk manual record'); }
    finally { setBulkSaving(false); }
  };
  const saveTest = async (index: number, status: TestStatus, evidenceType: EvidenceType, notes: string) => {
    if (!design) return;
    setError(null);
    const test = defaultTests[index];
    try {
      setSaving(`${test.source}-${test.destination}`);
      const existing = latestTest(test);
      const payload = {
        designId: design._id,
        testType: test.testType,
        source: test.source,
        destination: test.destination,
        status,
        evidenceType,
        notes,
      };
      const saved = existing ? await testsApi.update(existing._id, payload) : await testsApi.create(payload);
      setTests((prev) => [saved, ...prev.filter((record) => record._id !== saved._id)]);
      if (test.testType === 'ping') setMatrix((prev) => ({ ...prev, [test.source]: { ...prev[test.source], [test.destination]: status } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save test');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (error && !design) {
    return <Card><div className="p-6 text-center text-red-600">Error: {error}</div></Card>;
  }

  if (!design) {
    return <Card><div className="p-6 text-center text-slate-500">No design loaded</div></Card>;
  }

  const passedCount = defaultTests.filter((test) => latestTest(test)?.status === 'passed').length;
  const failedCount = defaultTests.filter((test) => latestTest(test)?.status === 'failed').length;
  const notRunCount = defaultTests.filter((test) => !latestTest(test) || latestTest(test)?.status === 'not-run').length;

  return (
    <div className="space-y-6">
      {error && <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
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
            <Button variant="secondary" size="sm" disabled={bulkSaving || saving !== null} onClick={() => bulkSave('passed')}>
              Mark All Passed
            </Button>
            <Button variant="secondary" size="sm" disabled={bulkSaving || saving !== null} onClick={() => bulkSave('not-run')}>
              Reset All
            </Button>
          </div>
        </CardHeader>
        <div className="card-body p-0">
          <div className="divide-y divide-slate-100">
            {defaultTests.map((test, index) => {
              const existingTest = latestTest(test);
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
                      aria-label={`Status for ${test.description}`} value={currentStatus}
                      onChange={(e) => saveTest(index, e.target.value as TestStatus, currentEvidence, currentNotes)}
                      className="input input-sm w-32"
                      disabled={bulkSaving || saving !== null}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                      aria-label={`Evidence for ${test.description}`} value={currentEvidence}
                      onChange={(e) => saveTest(index, currentStatus, e.target.value as EvidenceType, currentNotes)}
                      className="input input-sm w-40"
                      disabled={bulkSaving || saving !== null}
                    >
                      {evidenceTypes.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <Input
                      key={existingTest?._id ?? 'new'}
                      aria-label={`Notes for ${test.description}`}
                      defaultValue={currentNotes}
                      onBlur={(e) => { if (e.target.value !== currentNotes) saveTest(index, currentStatus, currentEvidence, e.target.value); }}
                      placeholder="Notes..."
                      className="w-48"
                      disabled={bulkSaving || saving !== null}
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

