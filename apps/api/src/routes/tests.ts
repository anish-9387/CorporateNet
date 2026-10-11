import { Router } from 'express';
import { testService } from '../services/test';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse } from '../utils/response';
import { createTestSchema, testFiltersSchema, testIdSchema } from './schemas';

const router = Router();

router.post(
  '/',
  validate(createTestSchema),
  asyncHandler(async (req, res) => {
    const test = await testService.create(req.body);
    res.status(201).json(successResponse(test));
  })
);

router.get(
  '/',
  validate(testFiltersSchema),
  asyncHandler(async (req, res) => {
    const result = await testService.findAll(req.query as Record<string, string>);
    res.json(successResponse(result.tests, { total: result.total }));
  })
);

router.get(
  '/matrix',
  validate(testFiltersSchema),
  asyncHandler(async (req, res) => {
    const designId = req.query.designId as string;
    if (!designId) {
      res.status(400).json(successResponse(null));
      return;
    }
    const matrix = await testService.getConnectivityMatrix(designId);
    res.json(successResponse(matrix));
  })
);

router.get(
  '/:id',
  validate(testIdSchema),
  asyncHandler(async (req, res) => {
    const test = await testService.findById(req.params.id);
    if (!test) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse(test));
  })
);

router.patch(
  '/:id',
  validate(testIdSchema),
  asyncHandler(async (req, res) => {
    const test = await testService.update(req.params.id, req.body);
    if (!test) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse(test));
  })
);

router.delete(
  '/:id',
  validate(testIdSchema),
  asyncHandler(async (req, res) => {
    const deleted = await testService.delete(req.params.id);
    if (!deleted) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse({ deleted: true }));
  })
);

export default router;