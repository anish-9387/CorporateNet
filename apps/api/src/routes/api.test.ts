import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { connectDatabase, disconnectDatabase } from '../utils/database';
import { NetworkDesignModel, TestRunModel, ScenarioModel } from '../models';

beforeAll(async () => {
  await connectDatabase();
});

afterAll(async () => {
  await Promise.all([
    NetworkDesignModel.deleteMany({}),
    TestRunModel.deleteMany({}),
    ScenarioModel.deleteMany({}),
  ]);
  await disconnectDatabase();
});

beforeEach(async () => {
  await Promise.all([
    NetworkDesignModel.deleteMany({}),
    TestRunModel.deleteMany({}),
    ScenarioModel.deleteMany({}),
  ]);
});

describe('Designs API', () => {
  const validDesign = {
    name: 'API Test Design',
    parentCidr: '10.0.0.0/24',
    departments: [
      { name: 'Dept A', hostRequirement: 50 },
      { name: 'Dept B', hostRequirement: 25 },
    ],
    devices: [{ hostname: 'R1', type: 'router' }],
    interfaces: [{ deviceId: 'R1', interfaceName: 'G0/0', networkCidr: '10.0.0.0/26' }],
    links: [],
    ospf: { processId: 1, areas: [0], routerIds: { R1: '1.1.1.1' } },
  };

  it('POST /api/v1/designs creates a design', async () => {
    const res = await request(app).post('/api/v1/designs').send(validDesign).expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('API Test Design');
    expect(res.body.data.departments).toHaveLength(2);
    expect(res.body.data.departments[0].networkCidr).toBeDefined();
  });

  it('POST /api/v1/designs validates required fields', async () => {
    const res = await request(app).post('/api/v1/designs').send({}).expect(422);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/v1/designs lists designs', async () => {
    await request(app).post('/api/v1/designs').send(validDesign).expect(201);

    const res = await request(app).get('/api/v1/designs').expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/designs/:id returns design', async () => {
    const createRes = await request(app).post('/api/v1/designs').send(validDesign).expect(201);
    const id = createRes.body.data._id;

    const res = await request(app).get(`/api/v1/designs/${id}`).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(id);
  });

  it('GET /api/v1/designs/:id returns 404 for non-existent', async () => {
    const res = await request(app).get('/api/v1/designs/507f1f77bcf86cd799439011').expect(404);
    expect(res.body.success).toBe(false);
  });

  it('PATCH /api/v1/designs/:id updates design', async () => {
    const createRes = await request(app).post('/api/v1/designs').send(validDesign).expect(201);
    const id = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/designs/${id}`)
      .send({ name: 'Updated Name', version: '2.0.0' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.version).toBe('2.0.0');
  });

  it('DELETE /api/v1/designs/:id deletes design', async () => {
    const createRes = await request(app).post('/api/v1/designs').send(validDesign).expect(201);
    const id = createRes.body.data._id;

    await request(app).delete(`/api/v1/designs/${id}`).expect(200);

    const getRes = await request(app).get(`/api/v1/designs/${id}`).expect(404);
    expect(getRes.body.success).toBe(false);
  });
});

describe('VLSM API', () => {
  it('POST /api/v1/vlsm/calculate returns calculated subnets', async () => {
    const res = await request(app)
      .post('/api/v1/vlsm/calculate')
      .send({
        parentCidr: '10.0.0.0/24',
        departments: [
          { name: 'A', hostCount: 50 },
          { name: 'B', hostCount: 25 },
        ],
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.isValid).toBe(true);
    expect(res.body.data.subnets).toHaveLength(2);
  });

  it('POST /api/v1/vlsm/calculate validates input', async () => {
    const res = await request(app)
      .post('/api/v1/vlsm/calculate')
      .send({ parentCidr: 'invalid', departments: [] })
      .expect(422);

    expect(res.body.success).toBe(false);
  });
});

describe('Tests API', () => {
  let designId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/designs')
      .send({
        name: 'Test Design for Tests',
        parentCidr: '10.0.0.0/24',
        departments: [{ name: 'Dept A', hostRequirement: 50 }],
        devices: [{ hostname: 'R1', type: 'router' }],
        interfaces: [],
        links: [],
        ospf: { processId: 1, areas: [0], routerIds: { R1: '1.1.1.1' } },
      });
    designId = res.body.data._id;
  });

  it('POST /api/v1/designs/:id/tests creates test', async () => {
    const res = await request(app)
      .post('/api/v1/tests')
      .send({
        designId,
        testType: 'ping',
        source: '10.0.0.10',
        destination: '10.0.0.20',
        status: 'passed',
        evidenceType: 'packet-tracer-ping',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('passed');
  });

  it('GET /api/v1/designs/:id/tests lists tests', async () => {
    await request(app)
      .post('/api/v1/tests')
      .send({
        designId,
        testType: 'ping',
        source: '10.0.0.10',
        destination: '10.0.0.20',
        status: 'passed',
        evidenceType: 'packet-tracer-ping',
      });

    const res = await request(app).get(`/api/v1/tests?designId=${designId}`).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.tests).toHaveLength(1);
  });

  it('GET /api/v1/designs/:id/tests/matrix returns connectivity matrix', async () => {
    await request(app)
      .post('/api/v1/tests')
      .send({
        designId,
        testType: 'ping',
        source: '10.0.0.10',
        destination: '10.0.0.20',
        status: 'passed',
        evidenceType: 'packet-tracer-ping',
      });

    const res = await request(app).get(`/api/v1/tests/matrix?designId=${designId}`).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data['10.0.0.10']['10.0.0.20']).toBe('passed');
  });
});

describe('Scenarios API', () => {
  let designId: string;
  let failedLinkId: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/v1/designs')
      .send({
        name: 'Test Design for Scenarios',
        parentCidr: '10.0.0.0/24',
        departments: [{ name: 'Dept A', hostRequirement: 50 }],
        devices: [{ hostname: 'R1', type: 'router' }, { hostname: 'R2', type: 'router' }],
        interfaces: [],
        links: [{ sourceDeviceId: 'R1', sourceInterface: 'S0/0/0', targetDeviceId: 'R2', targetInterface: 'S0/0/0', networkCidr: '10.0.1.0/30', medium: 'serial' }],
        ospf: { processId: 1, areas: [0], routerIds: { R1: '1.1.1.1', R2: '2.2.2.2' } },
      });
    designId = res.body.data._id;
    failedLinkId = res.body.data.links[0].linkId;
  });

  it('POST /api/v1/scenarios creates scenario', async () => {
    const res = await request(app)
      .post('/api/v1/scenarios')
      .send({
        designId,
        name: 'Link Failure',
        failedLinkId,
        affectedNetworks: ['10.0.0.0/26'],
        expectedBehavior: 'Network unreachable',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Link Failure');
    expect(res.body.data.isEducationalSimulation).toBe(true);
  });

  it('GET /api/v1/scenarios lists scenarios', async () => {
    await request(app)
      .post('/api/v1/scenarios')
      .send({
        designId,
        name: 'Link Failure',
        failedLinkId,
        affectedNetworks: ['10.0.0.0/26'],
        expectedBehavior: 'Network unreachable',
      });

    const res = await request(app).get(`/api/v1/scenarios?designId=${designId}`).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('Health Check', () => {
  it('GET /api/v1/health returns ok', async () => {
    const res = await request(app).get('/api/v1/health').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('API contract regressions', () => {
  let designId: string;
  beforeEach(async () => {
    const response = await request(app).post('/api/v1/designs').send({
      name: 'Regression design', parentCidr: '192.168.1.0/24',
      departments: [{ name: 'Engineering', hostRequirement: 50 }, { name: 'Finance', hostRequirement: 25 }],
      devices: [{ hostname: 'R1', type: 'router' }], interfaces: [], links: [],
      ospf: { processId: 1, areas: [0], routerIds: { R1: '1.1.1.1' } },
    }).expect(201);
    designId = response.body.data._id;
  });

  it('lists scenarios by query, validates updates, and returns consistent missing-record errors', async () => {
    await request(app).get(`/api/v1/scenarios?designId=${designId}`).expect(200);
    await request(app).get('/api/v1/scenarios').expect(422);
    const response = await request(app).post('/api/v1/tests').send({ designId, testType: 'ping', source: 'Engineering', destination: 'Finance', status: 'passed', evidenceType: 'manual' }).expect(201);
    await request(app).patch(`/api/v1/tests/${response.body.data._id}`).send({ status: 'invented' }).expect(422);
    const missing = await request(app).get('/api/v1/designs/507f1f77bcf86cd799439011').expect(404);
    expect(missing.body.success).toBe(false);
    await request(app).post('/api/v1/tests').send({ designId: '507f1f77bcf86cd799439011', testType: 'ping', source: 'A', destination: 'B', status: 'passed', evidenceType: 'manual' }).expect(404);
  });

  it('keeps the newest directional ping result beyond the first 100 records', async () => {
    await TestRunModel.insertMany(Array.from({ length: 110 }, (_, index) => ({ designId, testType: 'ping', source: index < 2 ? 'Engineering' : `Source ${index}`, destination: 'Finance', status: index === 1 ? 'failed' : 'passed', evidenceType: 'manual', testedAt: new Date(2026, 0, 1, 0, 0, index) })));
    const matrix = await request(app).get(`/api/v1/tests/matrix?designId=${designId}`).expect(200);
    expect(matrix.body.data.Engineering.Finance).toBe('failed');
    expect(matrix.body.data.Finance.Engineering).toBeUndefined();
    const list = await request(app).get(`/api/v1/tests?designId=${designId}&limit=5&offset=2`).expect(200);
    expect(list.body.data.tests).toHaveLength(5);
    expect(list.body.data.total).toBe(110);
  });

  it('exports actual markdown and removes dependent records with the design', async () => {
    await request(app).post('/api/v1/tests').send({ designId, testType: 'ping', source: 'Engineering', destination: 'Finance', status: 'passed', evidenceType: 'manual' }).expect(201);
    const report = await request(app).get(`/api/v1/designs/${designId}/report?format=markdown`).expect(200);
    expect(report.headers['content-type']).toContain('text/markdown');
    expect(report.text).toContain('# Regression design');
    expect(report.text).toContain('Engineering');
    await request(app).delete(`/api/v1/designs/${designId}`).expect(200);
    expect(await TestRunModel.countDocuments({ designId })).toBe(0);
  });

  it('rejects bad IPv4 input and malformed JSON without crashing', async () => {
    await request(app).post('/api/v1/vlsm/calculate').send({ parentCidr: '999.1.1.0/24', departments: [{ name: 'A', hostCount: 10 }] }).expect(422);
    await request(app).post('/api/v1/tests').set('Content-Type', 'application/json').send('{').expect(400);
  });
});
