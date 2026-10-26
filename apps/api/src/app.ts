import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { designService } from './services/design';
import { validate } from './middleware/validate';
import { vlsmCalculateSchema } from './routes/schemas';
import { asyncHandler } from './middleware/errorHandler';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { successResponse } from './utils/response';
import designsRouter from './routes/designs';
import testsRouter from './routes/tests';
import scenariosRouter from './routes/scenarios';

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: config.webOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
});
app.use('/api/', limiter);

app.get('/api/v1/health', (_req, res) => {
  res.json(successResponse({ status: 'ok', uptime: process.uptime() }));
});

app.use('/api/v1/designs', designsRouter);
app.post('/api/v1/vlsm/calculate', validate(vlsmCalculateSchema), asyncHandler(async (req, res) => {
  res.json(successResponse(await designService.calculateVLSM(req.body.parentCidr, req.body.departments)));
}));
app.use('/api/v1/tests', testsRouter);
app.use('/api/v1/scenarios', scenariosRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
