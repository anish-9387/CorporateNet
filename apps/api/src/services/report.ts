import { NetworkDesignModel, TestRunModel, ScenarioModel } from '../models';
import { INetworkDesign, ITestRun, IScenario } from '../models';
import { AppError } from '../utils/errors';

export interface ReportData {
  design: INetworkDesign;
  tests: ITestRun[];
  scenarios: IScenario[];
  generatedAt: string;
  version: string;
}

export const reportService = {
  async generate(designId: string): Promise<ReportData> {
    if (!designId.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest('Invalid design ID format');
    }

    const [design, tests, scenarios] = await Promise.all([
      NetworkDesignModel.findById(designId).lean<INetworkDesign>().exec(),
      TestRunModel.find({ designId }).sort({ testedAt: -1 }).lean<ITestRun[]>().exec(),
      ScenarioModel.find({ designId }).sort({ createdAt: -1 }).lean<IScenario[]>().exec(),
    ]);

    if (!design) {
      throw AppError.notFound('Design not found');
    }

    return {
      design,
      tests,
      scenarios,
      generatedAt: new Date().toISOString(),
      version: design.version,
    };
  },

  async exportMarkdown(designId: string): Promise<string> {
    const report = await this.generate(designId);
    const { design, tests, scenarios } = report;

    let markdown = `# ${design.name} - Network Design Report\n\n`;
    markdown += `**Version:** ${design.version}  \n`;
    markdown += `**Generated:** ${report.generatedAt}  \n`;
    markdown += `**Parent Network:** ${design.parentCidr}  \n\n`;

    markdown += `## Description\n\n${design.description ?? 'No description provided.'}\n\n`;

    markdown += `## Departments & Subnet Allocation\n\n`;
    markdown += `| Department | Hosts | Network | Gateway | Subnet Mask | Usable |\n`;
    markdown += `|------------|-------|---------|---------|-------------|--------|\n`;
    for (const dept of design.departments) {
      const prefix = dept.networkCidr.split('/')[1] ?? '24';
      markdown += `| ${dept.name} | ${dept.hostRequirement} | ${dept.networkCidr} | ${dept.gateway} | ${dept.subnetMask} | ${(1 << (32 - parseInt(prefix))) - 2} |\n`;
    }
    markdown += `\n`;

    markdown += `## Devices\n\n`;
    markdown += `| Device ID | Hostname | Type | Model | Management IP |\n`;
    markdown += `|-----------|----------|------|-------|---------------|\n`;
    for (const device of design.devices) {
      markdown += `| ${device.deviceId} | ${device.hostname} | ${device.type} | ${device.model ?? '-'} | ${device.managementIp ?? '-'} |\n`;
    }
    markdown += `\n`;

    markdown += `## Interfaces\n\n`;
    markdown += `| Device | Interface | IP Address | Subnet Mask | Network | Passive OSPF |\n`;
    markdown += `|--------|-----------|------------|-------------|---------|--------------|\n`;
    for (const iface of design.interfaces) {
      markdown += `| ${iface.deviceId} | ${iface.interfaceName} | ${iface.ipAddress ?? '-'} | ${iface.subnetMask ?? '-'} | ${iface.networkCidr ?? '-'} | ${iface.passiveOspf ? 'Yes' : 'No'} |\n`;
    }
    markdown += `\n`;

    markdown += `## Links\n\n`;
    markdown += `| Link ID | Source | Source Interface | Target | Target Interface | Network | Medium |\n`;
    markdown += `|---------|--------|------------------|--------|------------------|---------|--------|\n`;
    for (const link of design.links) {
      markdown += `| ${link.linkId} | ${link.sourceDeviceId} | ${link.sourceInterface} | ${link.targetDeviceId} | ${link.targetInterface} | ${link.networkCidr} | ${link.medium} |\n`;
    }
    markdown += `\n`;

    markdown += `## OSPF Configuration\n\n`;
    markdown += `- **Process ID:** ${design.ospf.processId}\n`;
    markdown += `- **Areas:** ${design.ospf.areas.join(', ')}\n`;
    markdown += `- **Router IDs:**\n`;
    for (const [deviceId, routerId] of Object.entries(design.ospf.routerIds)) {
      markdown += `  - ${deviceId}: ${routerId}\n`;
    }
    markdown += `\n`;

    markdown += `## Test Results\n\n`;
    if (tests.length === 0) {
      markdown += `No test results recorded.\n\n`;
    } else {
      markdown += `| Test Type | Source | Destination | Status | Evidence Type | Tested At | Notes |\n`;
      markdown += `|-----------|--------|-------------|--------|---------------|-----------|-------|\n`;
      for (const test of tests) {
        markdown += `| ${test.testType} | ${test.source} | ${test.destination} | ${test.status} | ${test.evidenceType} | ${test.testedAt.toISOString()} | ${test.notes ?? '-'} |\n`;
      }
      markdown += `\n`;
    }

    markdown += `## Failure Scenarios\n\n`;
    if (scenarios.length === 0) {
      markdown += `No failure scenarios defined.\n\n`;
    } else {
      for (const scenario of scenarios) {
        markdown += `### ${scenario.name}\n\n`;
        markdown += `**Description:** ${scenario.description ?? 'N/A'}  \n`;
        markdown += `**Failed Link:** ${scenario.failedLinkId}  \n`;
        markdown += `**Affected Networks:** ${scenario.affectedNetworks.join(', ')}  \n`;
        markdown += `**Expected Behavior:** ${scenario.expectedBehavior}  \n`;
        markdown += `**Observed Behavior:** ${scenario.observedBehavior ?? 'Not yet observed'}  \n`;
        markdown += `**Educational Simulation:** ${scenario.isEducationalSimulation ? 'Yes' : 'No'}  \n\n`;
      }
    }

    markdown += `---\n\n`;
    markdown += `*Report generated by CorporateNet Network Intelligence Dashboard*\n`;

    return markdown;
  },
};