import React, { useState, useEffect } from 'react';
import { designsApi } from '@/api/designs';
import { VLSMInput, VLSMResult, VLSMCalculationResponse, NetworkDesign } from '@/types';
import { Card, CardHeader, CardFooter, Badge, Input, Button, Table } from '@/components/common';

const defaultDepartments: VLSMInput[] = [
  { name: 'Engineering', hostCount: 100 },
  { name: 'Administration', hostCount: 50 },
  { name: 'Finance', hostCount: 25 },
  { name: 'HR', hostCount: 20 },
  { name: 'IT Support', hostCount: 12 },
];

export const VLSMStudio: React.FC = () => {
  const [parentCidr, setParentCidr] = useState('10.10.0.0/23');
  const [departments, setDepartments] = useState<VLSMInput[]>(defaultDepartments);
  const [result, setResult] = useState<VLSMCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDesign, setSavedDesign] = useState<NetworkDesign | null>(null);

  const calculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await designsApi.calculateVLSM(parentCidr, departments);
      setResult(response);
      if (!response.isValid) {
        setError(response.errors.join('; '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!result?.isValid) return;
    try {
      setLoading(true);
      const design = await designsApi.create({
        name: 'CorporateNet Design',
        description: 'VLSM calculated design',
        parentCidr,
        departments: departments.map((d) => ({ name: d.name, hostRequirement: d.hostCount })),
        devices: [
          { hostname: 'R1', type: 'router' },
          { hostname: 'R2', type: 'router' },
          { hostname: 'R3', type: 'router' },
          { hostname: 'SW-Eng', type: 'switch' },
          { hostname: 'SW-Admin', type: 'switch' },
          { hostname: 'SW-Fin', type: 'switch' },
          { hostname: 'SW-HR', type: 'switch' },
          { hostname: 'SW-IT', type: 'switch' },
        ],
        interfaces: [],
        links: [],
        ospf: { processId: 1, areas: [0], routerIds: { R1: '1.1.1.1', R2: '2.2.2.2', R3: '3.3.3.3' } },
      });
      setSavedDesign(design);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save design');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate();
  }, [parentCidr, departments]);

  const addDepartment = () => {
    setDepartments([...departments, { name: `Dept ${departments.length + 1}`, hostCount: 10 }]);
  };

  const updateDepartment = (index: number, field: keyof VLSMInput, value: string | number) => {
    const updated = [...departments];
    updated[index] = { ...updated[index], [field]: value };
    setDepartments(updated);
  };

  const removeDepartment = (index: number) => {
    if (departments.length <= 1) return;
    setDepartments(departments.filter((_, i) => i !== index));
  };

  const totalHosts = departments.reduce((sum, d) => sum + d.hostCount, 0);
  const totalUsable = result?.subnets.reduce((sum, s) => sum + s.usableAddresses, 0) ?? 0;
  const utilization = totalUsable > 0 ? Math.round((totalHosts / totalUsable) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">VLSM Calculator</h2>
            <div className="flex items-center gap-2">
              <Badge variant={result?.isValid ? 'success' : 'error'}>
                {result?.isValid ? 'Valid Allocation' : 'Invalid'}
              </Badge>
            </div>
          </CardHeader>
          <div className="card-body space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Parent Network (CIDR)"
                value={parentCidr}
                onChange={(e) => setParentCidr(e.target.value)}
                placeholder="10.10.0.0/23"
                helperText="Base network for all allocations"
              />
              <div className="flex items-end">
                <label className="label w-full">Total Hosts Required</label>
              </div>
              <div className="flex items-end">
                <label className="label w-full">Address Utilization</label>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900">Department Requirements</h3>
                <Button variant="secondary" size="sm" onClick={addDepartment}>
                  Add Department
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-4">
                  <Input label="Name" placeholder="Department name" />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Input label="Host Count" type="number" placeholder="50" />
                </div>
                <div className="col-span-12 md:col-span-3">
                  <Input label="Reserved (optional)" type="number" placeholder="5" />
                </div>
                <div className="col-span-12 md:col-span-2 flex items-end">
                  <Button variant="ghost" size="sm" className="w-full text-red-600 hover:bg-red-50">
                    Remove
                  </Button>
                </div>
              </div>
              {departments.map((dept, index) => (
                <div key={index} className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4">
                    <Input
                      value={dept.name}
                      onChange={(e) => updateDepartment(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <Input
                      type="number"
                      min="1"
                      value={dept.hostCount}
                      onChange={(e) => updateDepartment(index, 'hostCount', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <Input
                      type="number"
                      min="0"
                      value={dept.reservedCapacity ?? 0}
                      onChange={(e) => updateDepartment(index, 'reservedCapacity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-2 flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-600 hover:bg-red-50"
                      onClick={() => removeDepartment(index)}
                      disabled={departments.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Validation Errors:</strong> {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button variant="primary" onClick={handleSaveDesign} disabled={loading || !result?.isValid}>
                {loading ? 'Saving...' : 'Save Design'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>
          </CardHeader>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Parent Network</p>
                <p className="font-mono text-sm text-slate-900">{parentCidr}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Departments</p>
                <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total Hosts</p>
                <p className="text-2xl font-bold text-slate-900">{totalHosts}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Utilization</p>
                <p className="text-2xl font-bold text-slate-900">{utilization}%</p>
              </div>
            </div>

            <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-center">
              {utilization}% of address space utilized
            </p>
          </div>
        </Card>
      </div>

      {result && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Calculated Subnet Allocation</h2>
          </CardHeader>
          <div className="card-body p-0">
            <Table
              columns={[
                { key: 'name', header: 'Department' },
                { key: 'hostCount', header: 'Required Hosts' },
                { key: 'networkAddress', header: 'Network Address', render: (row: VLSMResult) => <code className="font-mono text-sm">{row.networkAddress}/{row.prefix}</code> },
                { key: 'gateway', header: 'Gateway', render: (row: VLSMResult) => <code className="font-mono text-sm">{row.gateway}</code> },
                { key: 'subnetMask', header: 'Subnet Mask', render: (row: VLSMResult) => <code className="font-mono text-sm">{row.subnetMask}</code> },
                { key: 'wildcardMask', header: 'Wildcard Mask', render: (row: VLSMResult) => <code className="font-mono text-sm">{row.wildcardMask}</code> },
                { key: 'firstUsable', header: 'First Usable', render: (row: VLSMResult) => <code className="font-mono text-sm">{row.firstUsable}</code> },
                { key: 'lastUsable', header: 'Last Usable', render: (row: VLSMResult) => <code className="font-mono text-sm">{row.lastUsable}</code> },
                { key: 'broadcast', header: 'Broadcast', render: (row: VLSMResult) => <code className="font-mono text-sm">{row.broadcast}</code> },
                { key: 'usableAddresses', header: 'Usable IPs' },
                { key: 'utilizationPercent', header: 'Utilization', render: (row: VLSMResult) => `${row.utilizationPercent}%` },
              ]}
              data={result.subnets}
              keyExtractor={(row) => row.name}
              striped
            />
          </div>
        </Card>
      )}

      {result && result.remainingAddressSpace.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Remaining Address Space</h2>
          </CardHeader>
          <div className="card-body">
            <div className="flex flex-wrap gap-2">
              {result.remainingAddressSpace.map((cidr, index) => (
                <Badge key={index} variant="neutral" className="font-mono text-xs">
                  {cidr}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}

      {savedDesign && (
        <Card className="border-green-300 bg-green-50">
          <CardHeader>
            <h2 className="text-lg font-semibold text-green-900">Design Saved Successfully</h2>
          </CardHeader>
          <div className="card-body">
            <p className="text-green-700">Design ID: <code className="font-mono">{savedDesign._id}</code></p>
            <p className="text-sm text-green-600 mt-1">You can now view this design in Topology, Routing, and other sections.</p>
          </div>
        </Card>
      )}
    </div>
  );
};