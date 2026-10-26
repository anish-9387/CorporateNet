import React, { useEffect, useState } from 'react';
import { designsApi, reportService } from '@/api';
import { NetworkDesign, ReportData } from '@/types';
import { Card, CardHeader, Badge, StatusBadge, Table, Button } from '@/components/common';

export const Reports: React.FC = () => {
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const designs = await designsApi.list();
        if (designs.length > 0) {
          setDesign(designs[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load design');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateReport = async () => {
    if (!design) return;
    setError(null);
    try {
      setGenerating(true);
      const data = await reportService.generate(design._id);
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const exportMarkdown = async () => {
    if (!design) return;
    setError(null);
    try {
      setGenerating(true);
      const markdown = await reportService.exportMarkdown(design._id);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `corporatenet-report-${design._id}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    } finally {
      setGenerating(false);
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

  const totalTests = report?.tests.length ?? 0;
  const passedTests = report?.tests.filter((t) => t.status === 'passed').length ?? 0;
  const failedTests = report?.tests.filter((t) => t.status === 'failed').length ?? 0;

  return (
    <div className="space-y-6">
      {error && <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Reports</h2>
          <p className="text-sm text-slate-500">Generate and export network design documentation</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={generateReport} disabled={generating}>
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
          <Button variant="primary" onClick={exportMarkdown} disabled={generating || !report}>
            Export Markdown
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Design Version</p>
            <p className="text-2xl font-bold text-slate-900">{design.version}</p>
          </div>
        </Card>
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Tests</p>
            <p className="text-2xl font-bold text-slate-900">{totalTests}</p>
          </div>
        </Card>
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Passed</p>
            <p className="text-2xl font-bold text-green-600">{passedTests}</p>
          </div>
        </Card>
        <Card>
          <div className="card-body text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Failed</p>
            <p className="text-2xl font-bold text-red-600">{failedTests}</p>
          </div>
        </Card>
      </div>

      {report && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">Design Summary</h3>
          </CardHeader>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Network Information</h4>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Project Name</dt>
                    <dd className="font-medium text-slate-900">{report.design.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Parent Network</dt>
                    <dd className="font-mono text-slate-900">{report.design.parentCidr}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Departments</dt>
                    <dd className="font-medium text-slate-900">{report.design.departments.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Routers</dt>
                    <dd className="font-medium text-slate-900">{report.design.devices.filter((d) => d.type === 'router').length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Switches</dt>
                    <dd className="font-medium text-slate-900">{report.design.devices.filter((d) => d.type === 'switch').length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">OSPF Process ID</dt>
                    <dd className="font-mono text-slate-900">{report.design.ospf.processId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">OSPF Areas</dt>
                    <dd className="font-mono text-slate-900">{report.design.ospf.areas.join(', ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Generated</dt>
                    <dd className="font-mono text-slate-900">{new Date(report.generatedAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">Test Summary</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Interface Status', type: 'interface-status' },
                    { label: 'OSPF Neighbors', type: 'ospf-neighbor' },
                    { label: 'OSPF Routes', type: 'ospf-route' },
                    { label: 'DHCP Leases', type: 'dhcp-lease' },
                    { label: 'Ping Tests', type: 'ping' },
                    { label: 'Traceroute', type: 'traceroute' },
                  ].map((item) => {
                    const typeTests = report!.tests.filter((t) => t.testType === item.type);
                    const passed = typeTests.filter((t) => t.status === 'passed').length;
                    const total = typeTests.length;
                    return (
                      <div key={item.type} className="flex flex-wrap gap-4 items-center justify-between">
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <div className="flex items-center gap-2">
                          {total > 0 && (
                            <>
                              <StatusBadge status={typeTests.some((test) => test.status === 'failed') ? 'failed' : passed === total ? 'passed' : 'not-run'} />
                              <span className="text-sm font-mono text-slate-500">{passed}/{total}</span>
                            </>
                          )}
                          {total === 0 && <Badge variant="neutral">Not Run</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">Department Subnets</h4>
              <Table
                columns={[
                  { key: 'name', header: 'Department' },
                  { key: 'hostRequirement', header: 'Required Hosts' },
                  { key: 'networkCidr', header: 'Allocated Network', render: (row) => <code className="font-mono text-sm">{row.networkCidr}</code> },
                  { key: 'gateway', header: 'Gateway', render: (row) => <code className="font-mono text-sm">{row.gateway}</code> },
                  { key: 'subnetMask', header: 'Subnet Mask', render: (row) => <code className="font-mono text-sm">{row.subnetMask}</code> },
                ]}
                data={report.design.departments}
                keyExtractor={(row) => row.name}
                striped
              />
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-3">Router Configurations</h4>
              <Table
                columns={[
                  { key: 'hostname', header: 'Hostname' },
                  { key: 'type', header: 'Type' },
                  { key: 'model', header: 'Model' },
                  { key: 'managementIp', header: 'Management IP', render: (row) => <code className="font-mono text-sm">{row.managementIp ?? 'N/A'}</code> },
                ]}
                data={report.design.devices.filter((d) => d.type === 'router')}
                keyExtractor={(row) => row.deviceId}
                striped
              />
            </div>

            {report.scenarios.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Failure Scenarios</h4>
                <div className="space-y-4">
                  {report.scenarios.map((scenario) => (
                    <div key={scenario._id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-slate-900">{scenario.name}</h5>
                        <Badge variant="info">{scenario.failedLinkId}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{scenario.expectedBehavior}</p>
                      {scenario.observedBehavior && (
                        <p className="text-sm text-slate-600"><strong>Observed:</strong> {scenario.observedBehavior}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                Report generated by CorporateNet Network Intelligence Dashboard
                <br />
                Data source: Design dataset | Verified: Only where explicitly marked
              </p>
            </div>
          </div>
        </Card>
      )}

      {!report && (
        <Card>
          <div className="card-body text-center py-12">
            <p className="text-slate-500 mb-4">No report generated yet. Click "Generate Report" to create one.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

