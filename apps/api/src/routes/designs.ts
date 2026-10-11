import { Router } from 'express';
import { designService } from '../services/design';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse } from '../utils/response';
import {
  createDesignSchema,
  updateDesignSchema,
  designIdSchema,
  vlsmCalculateSchema,
} from './schemas';

const router = Router();

router.post(
  '/',
  validate(createDesignSchema),
  asyncHandler(async (req, res) => {
    const design = await designService.create(req.body);
    res.status(201).json(successResponse(design, { verified: false }));
  })
);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const designs = await designService.findAll();
    res.json(successResponse(designs));
  })
);

router.get(
  '/:id',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const design = await designService.findById(req.params.id);
    if (!design) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse(design));
  })
);

router.patch(
  '/:id',
  validate(updateDesignSchema),
  asyncHandler(async (req, res) => {
    const design = await designService.update(req.params.id, req.body);
    if (!design) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse(design));
  })
);

router.delete(
  '/:id',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const deleted = await designService.delete(req.params.id);
    if (!deleted) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse({ deleted: true }));
  })
);

router.post(
  '/vlsm/calculate',
  validate(vlsmCalculateSchema),
  asyncHandler(async (req, res) => {
    const result = await designService.calculateVLSM(req.body.parentCidr, req.body.departments);
    res.json(successResponse(result));
  })
);

router.get(
  '/:id/topology',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const topology = await designService.getTopology(req.params.id);
    res.json(successResponse(topology));
  })
);

router.get(
  '/:id/routes',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const routes = await designService.getRoutingInfo(req.params.id);
    res.json(successResponse(routes));
  })
);

router.get(
  '/:id/report',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const { reportService } = await import('../services/report');
    const format = req.query.format as string;
    if (format === 'markdown') {
      const markdown = await reportService.exportMarkdown(req.params.id);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="report-${req.params.id}.md"`);
      res.send(markdown);
      return;
    }
    const report = await reportService.generate(req.params.id);
    res.json(successResponse(report));
  })
);

export default router;