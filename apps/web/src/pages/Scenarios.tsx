import React, { useEffect, useState } from 'react';
import { designsApi, scenariosApi } from '@/api';
import { NetworkDesign, Scenario } from '@/types';
import { Card, CardHeader, CardFooter, Badge, StatusBadge, Button, Input } from '@/components/common';

interface ScenarioFormData {
  name: string;
  description: string;
  failedLinkId: string;
  affectedNetworks: string;
  expectedBehavior: string;
  observedBehavior: string;
}

export const Scenarios: React.FC = () => {
  const [design, setDesign] = useState<NetworkDesign | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [formData, setFormData] = useState<ScenarioFormData>({
    name: '',
    description: '',
    failedLinkId: '',
    affectedNetworks: '',
    expectedBehavior: '',
    observedBehavior: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const designs = await designsApi.list();
        if (designs.length > 0) {
          const d = designs[0];
          setDesign(d);
          const scens = await scenariosApi.list(d._id);
          setScenarios(scens);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scenarios');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!design) return;

    try {
      if (editingScenario) {
        await scenariosApi.update(editingScenario._id, {
          ...formData,
          affectedNetworks: formData.affectedNetworks.split(',').map((s) => s.trim()).filter(Boolean),
        });
        setScenarios(scenarios.map((s) => (s._id === editingScenario._id ? { ...s, ...formData, affectedNetworks: formData.affectedNetworks.split(',').map((s) => s.trim()).filter(Boolean) } : s)));
      } else {
        const newScenario = await scenariosApi.create({
          designId: design._id,
          ...formData,
          affectedNetworks: formData.affectedNetworks.split(',').map((s) => s.trim()).filter(Boolean),
        });
        setScenarios([newScenario, ...scenarios]);
      }
      setShowForm(false);
      setEditingScenario(null);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save scenario');
    }
  };

  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setFormData({
      name: scenario.name,
      description: scenario.description ?? '',
      failedLinkId: scenario.failedLinkId,
      affectedNetworks: scenario.affectedNetworks.join(', '),
      expectedBehavior: scenario.expectedBehavior,
      observedBehavior: scenario.observedBehavior ?? '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scenario?')) return;
    try {
      await scenariosApi.delete(id);
      setScenarios(scenarios.filter((s) => s._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete scenario');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      failedLinkId: '',
      affectedNetworks: '',
      expectedBehavior: '',
      observedBehavior: '',
    });
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

  const serialLinks = design.links.filter((l) => l.medium === 'serial');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Failure Scenarios</h2>
          <p className="text-sm text-slate-500">Simulate link failures and analyze impact</p>
        </div>
        <Button onClick={() => { setEditingScenario(null); resetForm(); setShowForm(true); }}>
          Add Scenario
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-slate-900">{editingScenario ? 'Edit Scenario' : 'Create Scenario'}</h3>
          </CardHeader>
          <form onSubmit={handleSubmit} className="card-body space-y-4">
            <Input label="Scenario Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <Input label="Failed Link ID" value={formData.failedLinkId} onChange={(e) => setFormData({ ...formData, failedLinkId: e.target.value })} placeholder="e.g., link-r1-r2" required />
            <div className="flex flex-col gap-2">
              <label className="label">Affected Networks (comma-separated)</label>
              <Input
                value={formData.affectedNetworks}
                onChange={(e) => setFormData({ ...formData, affectedNetworks: e.target.value })}
                placeholder="10.10.1.0/28, 10.10.1.20/30"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Expected Behavior</label>
              <textarea
                value={formData.expectedBehavior}
                onChange={(e) => setFormData({ ...formData, expectedBehavior: e.target.value })}
                className="input min-h-[80px] resize-y"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="label">Observed Behavior (optional)</label>
              <textarea
                value={formData.observedBehavior}
                onChange={(e) => setFormData({ ...formData, observedBehavior: e.target.value })}
                className="input min-h-[80px] resize-y"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked defaultChecked className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" disabled />
                <span className="text-sm text-slate-700">Educational simulation only (not live Packet Tracer state)</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditingScenario(null); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingScenario ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Chain Topology Vulnerability</h3>
          <Badge variant="warning">No Redundancy</Badge>
        </CardHeader>
        <div className="card-body">
          <p className="text-slate-600 mb-4">
            The current R1—R2—R3 chain topology has no alternate paths. Any single link failure partitions the network.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {serialLinks.map((link) => (
              <div key={link.linkId} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Link: {link.linkId}</h4>
                <p className="text-sm text-red-700 mb-2">
                  {link.sourceDeviceId} ({link.sourceInterface}) ↔ {link.targetDeviceId} ({link.targetInterface})
                </p>
                <p className="text-sm text-red-700">Network: <code className="font-mono">{link.networkCidr}</code></p>
                <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
                  <strong>Impact:</strong> {link.targetDeviceId} and downstream networks become unreachable from {link.sourceDeviceId} side.
                  OSPF cannot converge to an alternate path because none exists.
                </div>
              </div>
            ))}
          </div>
        </div>
        <CardFooter>
          <p className="text-sm text-slate-500">
            <strong>Future Improvement:</strong> Add R1—R3 direct link with unique /30 subnet to create a ring topology
            with full redundancy. OSPF would then converge to the alternate path within seconds.
          </p>
        </CardFooter>
      </Card>

      {scenarios.length === 0 ? (
        <Card>
          <div className="card-body text-center py-12">
            <p className="text-slate-500 mb-4">No failure scenarios defined yet.</p>
            <Button onClick={() => { setEditingScenario(null); resetForm(); setShowForm(true); }}>
              Create First Scenario
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <Card key={scenario._id} className="border-slate-200">
              <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{scenario.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{scenario.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="info">{scenario.failedLinkId}</Badge>
                  <StatusBadge status={scenario.isEducationalSimulation ? 'configured' : 'verified'} />
                </div>
              </CardHeader>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Affected Networks</p>
                    <div className="flex flex-wrap gap-1.5">
                      {scenario.affectedNetworks.map((net) => (
                        <Badge key={net} variant="neutral" className="font-mono text-xs">{net}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Expected Behavior</p>
                    <p className="text-sm text-slate-700">{scenario.expectedBehavior}</p>
                  </div>
                </div>
                {scenario.observedBehavior && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Observed Behavior</p>
                    <p className="text-sm text-slate-700">{scenario.observedBehavior}</p>
                  </div>
                )}
              </div>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(scenario)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(scenario._id)}>
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};