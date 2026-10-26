import { AppError } from '../utils/errors';
import { Router } from 'express';
import { scenarioService } from '../services/scenario';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse } from '../utils/response';
import { createScenarioSchema, scenarioIdSchema, scenarioFiltersSchema, updateScenarioSchema } from './schemas';

const router: Router = Router();

router.post(
  '/',
  validate(createScenarioSchema),
  asyncHandler(async (req, res) => {
    const scenario = await scenarioService.create(req.body);
    res.status(201).json(successResponse(scenario));
  })
);

router.get(
  '/',
  validate(scenarioFiltersSchema),
  asyncHandler(async (req, res) => {
    const scenarios = await scenarioService.findByDesignId(req.query.designId as string);
    res.json(successResponse(scenarios));
  })
);

router.get(
  '/:id',
  validate(scenarioIdSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    const scenario = await scenarioService.findById(id);
    if (!scenario) {
      throw AppError.notFound('Record not found');
    }
    res.json(successResponse(scenario));
  })
);

router.patch(
  '/:id',
  validate(updateScenarioSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    const scenario = await scenarioService.update(id, req.body);
    if (!scenario) {
      throw AppError.notFound('Record not found');
    }
    res.json(successResponse(scenario));
  })
);

router.delete(
  '/:id',
  validate(scenarioIdSchema),
  asyncHandler(async (req, res) => {
    const id = req.params.id!;
    const deleted = await scenarioService.delete(id);
    if (!deleted) {
      throw AppError.notFound('Record not found');
    }
    res.json(successResponse({ deleted: true }));
  })
);

export default router;

