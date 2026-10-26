import { z } from 'zod';

const cidr = z.string().refine((value) => {
  const [ip, prefix] = value.split('/');
  return /^\d{1,3}(\.\d{1,3}){3}\/(\d|[12]\d|3[0-2])$/.test(value) &&
    ip!.split('.').every((octet) => Number(octet) <= 255) && Number(prefix) <= 32;
}, 'Invalid IPv4 CIDR');

export const createDesignSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    parentCidr: cidr,
    departments: z.array(
      z.object({
        name: z.string().min(1).max(50),
        hostRequirement: z.number().int().positive(),
        reservedCapacity: z.number().int().nonnegative().optional(),
      })
    ).min(1),
    devices: z.array(
      z.object({
        hostname: z.string().min(1).max(50),
        type: z.enum(['router', 'switch', 'pc', 'server']),
        model: z.string().max(50).optional(),
        managementIp: z.string().optional(),
      })
    ).min(1),
    interfaces: z.array(
      z.object({
        deviceId: z.string(),
        interfaceName: z.string(),
        ipAddress: z.string().optional(),
        subnetMask: z.string().optional(),
        networkCidr: z.string().optional(),
        passiveOspf: z.boolean().optional(),
      })
    ),
    links: z.array(
      z.object({
        sourceDeviceId: z.string(),
        sourceInterface: z.string(),
        targetDeviceId: z.string(),
        targetInterface: z.string(),
        networkCidr: z.string(),
        medium: z.enum(['ethernet', 'serial', 'fiber']),
      })
    ),
    ospf: z.object({
      processId: z.number().int().positive(),
      areas: z.array(z.number().int().nonnegative()).min(1),
      routerIds: z.record(z.string()),
    }),
  }),
});

export const updateDesignSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    version: z.string().optional(),
    parentCidr: cidr.optional(),
    departments: z.array(
      z.object({
        name: z.string(),
        hostRequirement: z.number().int().positive(),
        reservedCapacity: z.number().int().nonnegative().optional(),
        networkCidr: z.string(),
        gateway: z.string(),
        subnetMask: z.string(),
      })
    ).optional(),
    devices: z.array(
      z.object({
        deviceId: z.string(),
        hostname: z.string(),
        type: z.enum(['router', 'switch', 'pc', 'server']),
        model: z.string().optional(),
        managementIp: z.string().optional(),
      })
    ).optional(),
    interfaces: z.array(
      z.object({
        deviceId: z.string(),
        interfaceName: z.string(),
        ipAddress: z.string().optional(),
        subnetMask: z.string().optional(),
        networkCidr: z.string().optional(),
        passiveOspf: z.boolean().optional(),
      })
    ).optional(),
    links: z.array(
      z.object({
        linkId: z.string(),
        sourceDeviceId: z.string(),
        sourceInterface: z.string(),
        targetDeviceId: z.string(),
        targetInterface: z.string(),
        networkCidr: z.string(),
        medium: z.enum(['ethernet', 'serial', 'fiber']),
      })
    ).optional(),
    ospf: z.object({
      processId: z.number().int().positive(),
      areas: z.array(z.number().int().nonnegative()),
      routerIds: z.record(z.string()),
    }).optional(),
  }),
});

export const designIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const vlsmCalculateSchema = z.object({
  body: z.object({
    parentCidr: cidr,
    departments: z.array(
      z.object({
        name: z.string().min(1),
        hostCount: z.number().int().positive(),
        reservedCapacity: z.number().int().nonnegative().optional(),
      })
    ).min(1),
  }),
});

export const createTestSchema = z.object({
  body: z.object({
    designId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    testType: z.string().min(1).max(50),
    source: z.string().min(1),
    destination: z.string().min(1),
    status: z.enum(['passed', 'failed', 'not-run', 'not-applicable']),
    observedOutput: z.string().optional(),
    evidenceType: z.enum(['packet-tracer-cli', 'packet-tracer-ping', 'manual', 'simulated']),
    notes: z.string().max(1000).optional(),
    testedAt: z.coerce.date().optional(),
  }),
});

export const testFiltersSchema = z.object({
  query: z.object({
    designId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    testType: z.string().optional(),
    status: z.enum(['passed', 'failed', 'not-run', 'not-applicable']).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
    offset: z.coerce.number().int().nonnegative().optional(),
  }),
});

export const testIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const createScenarioSchema = z.object({
  body: z.object({
    designId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    failedLinkId: z.string().min(1),
    affectedNetworks: z.array(z.string()).min(1),
    expectedBehavior: z.string().min(1),
    observedBehavior: z.string().optional(),
    isEducationalSimulation: z.boolean().optional(),
  }),
});

export const scenarioIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
  }),
});

export const scenarioFiltersSchema = z.object({
  query: z.object({ designId: z.string().regex(/^[0-9a-fA-F]{24}$/) }),
});

export const updateTestSchema = z.object({
  params: testIdSchema.shape.params,
  body: createTestSchema.shape.body.omit({ designId: true }).partial(),
});

export const updateScenarioSchema = z.object({
  params: scenarioIdSchema.shape.params,
  body: createScenarioSchema.shape.body.omit({ designId: true }).partial(),
});
