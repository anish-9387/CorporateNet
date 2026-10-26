import { AppError } from '../utils/errors';
import { Router } from 'express';
import { designService } from '../services/design';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse } from '../utils/response';
import { reportService } from '../services/report';
import {
  createDesignSchema,
  updateDesignSchema,
  designIdSchema,
  vlsmCalculateSchema,
} from './schemas';

const router: Router = Router();

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
    const id = req.params.id!;
    const design = await designService.findById(id);
    if (!design) {
      throw AppError.notFound('Record not found');
    }
    res.json(successResponse(design));
  })
);

router.patch(
  '/:id',
  validate(updateDesignSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    const design = await designService.update(id, req.body);
    if (!design) {
      throw AppError.notFound('Record not found');
    }
    res.json(successResponse(design));
  })
);

router.delete(
  '/:id',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    const deleted = await designService.delete(id);
    if (!deleted) {
      throw AppError.notFound('Record not found');
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
    const id = req.params.id!;
    const topology = await designService.getTopology(id);
    res.json(successResponse(topology));
  })
);

router.get(
  '/:id/routes',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    const routes = await designService.getRoutingInfo(id);
    res.json(successResponse(routes));
  })
);

router.get(
  '/:id/report',
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    const format = req.query.format as string;
    if (format === 'markdown') {
      const markdown = await reportService.exportMarkdown(id);
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="report-${id}.md"`);
      res.send(markdown);
      return;
    }
    const report = await reportService.generate(id);
    res.json(successResponse(report));
  })
);

export default router;
