import { Router } from 'express';
import { scenarioService } from '../services/scenario';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { successResponse } from '../utils/response';
import { createScenarioSchema, scenarioIdSchema, designIdSchema } from './schemas';

const router = Router();

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
  validate(designIdSchema),
  asyncHandler(async (req, res) => {
    const scenarios = await scenarioService.findByDesignId(req.query.designId as string);
    res.json(successResponse(scenarios));
  })
);

router.get(
  '/:id',
  validate(scenarioIdSchema),
  asyncHandler(async (req, res) => {
    const scenario = await scenarioService.findById(req.params.id);
    if (!scenario) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse(scenario));
  })
);

router.patch(
  '/:id',
  validate(scenarioIdSchema),
  asyncHandler(async (req, res) => {
    const scenario = await scenarioService.update(req.params.id, req.body);
    if (!scenario) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse(scenario));
  })
);

router.delete(
  '/:id',
  validate(scenarioIdSchema),
  asyncHandler(async (req, res) => {
    const deleted = await scenarioService.delete(req.params.id);
    if (!deleted) {
      res.status(404).json(successResponse(null));
      return;
    }
    res.json(successResponse({ deleted: true }));
  })
);

export default router;