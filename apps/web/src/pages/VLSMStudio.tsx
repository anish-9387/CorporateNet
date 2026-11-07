import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, Badge, Input, Button, Table } from '@/components/common';
import { calculateVLSM } from '@/data/labData';
import type { VLSMInput, VLSMResult, VLSMCalculationResponse } from '@/types';

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

  useEffect(() => {
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      try {
        const response = calculateVLSM(parentCidr, departments);
        setResult(response);
        if (!response.isValid) setError(response.errors.join('; '));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calculation failed');
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(timer);
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

  const totalHosts = useMemo(() => departments.reduce((sum, d) => sum + d.hostCount, 0), [departments]);
  const totalUsable = useMemo(() => result?.subnets.reduce((sum, s) => sum + s.usableAddresses, 0) ?? 0, [result]);
  const utilization = totalUsable > 0 ? Math.round((totalHosts / totalUsable) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">VLSM Calculator (Client-Side)</h2>
            <div className="flex items-center gap-2">
              <Badge variant={result?.isValid ? 'success' : 'error'}>
                {result?.isValid ? 'Valid Allocation' : 'Invalid'}
              </Badge>
              <Badge variant="info">No API Required</Badge>
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
                <p className="text-sm text-slate-500">Total hosts: <strong className="text-slate-900">{totalHosts}</strong></p>
              </div>
              <div className="flex items-end">
                <p className="text-sm text-slate-500">Host capacity used: <strong className="text-slate-900">{utilization}%</strong></p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-slate-900">Department Requirements</h3>
                <Button variant="secondary" size="sm" onClick={addDepartment}>
                  Add Department
                </Button>
              </div>
              <div className="hidden md:grid grid-cols-12 gap-3 text-xs text-slate-500">
                <span className="col-span-4">Department</span>
                <span className="col-span-3">Hosts</span>
                <span className="col-span-3">Reserved Capacity</span>
              </div>
              {departments.map((dept, index) => (
                <div key={index} className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4">
                    <Input
                      aria-label={`Department ${index + 1} name`} 
                      value={dept.name}
                      onChange={(e) => updateDepartment(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <Input
                      type="number"
                      min="1"
                      aria-label={`Hosts for ${dept.name}`} 
                      value={dept.hostCount}
                      onChange={(e) => updateDepartment(index, 'hostCount', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <Input
                      type="number"
                      min="0"
                      aria-label={`Reserved capacity for ${dept.name}`} 
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
              <Button variant="primary" disabled={loading || !result?.isValid}>
                {loading ? 'Calculating...' : 'Recalculate'}
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
              {utilization}% of usable host capacity utilized
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
            <p className="text-xs text-slate-500 mt-2">
              These blocks are available for future growth. Total unallocated: 
              {result.remainingAddressSpace.reduce((sum, cidr) => {
                const prefix = parseInt(cidr.split('/')[1]);
                return sum + (1 << (32 - prefix));
              }, 0)} addresses ({Math.round(result.remainingAddressSpace.reduce((sum, cidr) => {
                const prefix = parseInt(cidr.split('/')[1]);
                return sum + (1 << (32 - prefix));
              }, 0) / 512 * 100)}% of parent)
            </p>
          </div>
        </Card>
      )}

      <Card className="border-blue-300 bg-blue-50">
        <CardHeader>
          <h2 className="text-lg font-semibold text-blue-900">About This Calculator</h2>
        </CardHeader>
        <div className="card-body space-y-2 text-sm text-blue-800">
          <p><strong>Largest-first VLSM algorithm</strong> implemented entirely in the browser — no API calls needed.</p>
          <p>Sorts departments by (hosts + reserved) descending, allocates aligned blocks, checks parent boundaries and overlap.</p>
          <p>Matches the addressing plan used in <code className="font-mono bg-blue-100 px-1.5 py-0.5 rounded">Scalable_Corporate_Network_CN.pkt</code>.</p>
          <p className="text-xs">Formula: prefix = 32 - ceil(log2(requiredHosts + reserved + 2)) for network/broadcast.</p>
        </div>
      </Card>
    </div>
  );
};
