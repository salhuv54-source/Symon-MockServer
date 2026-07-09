import { Router } from 'express';
import faultsRoutes from './routes/faults.routes';
import commandsRoutes from './routes/commands.routes';
import esdumpRoutes from './routes/esdump.routes';
import authRoutes from './routes/auth.routes';
import alertsRoutes from './routes/alerts.routes';
import bitReportRoutes from './routes/bit-report.routes';
import calibrationRoutes from './routes/calibration.routes';
import explanationRoutes from './routes/explanation.routes';
import healthRoutes from './routes/health.routes';
import DashboardRoutes from './routes/dashboard.routes';
import loggerRoutes from './routes/logger.routes';
import mapsRoutes from './routes/maps.routes';
import polygonsRoutes from './routes/polygons.routes';
import systemInfoRoutes from './routes/system-info.routes';
import systemProductsRoutes from './routes/system-products.routes';
import versionRoutes from './routes/version.routes';

/**
 * Creates and returns a Router with handlers for all MainRoutes routes.
 */
export function createRouteService(): Router {
  const router = Router();

  faultsRoutes(router);
  commandsRoutes(router);
  esdumpRoutes(router);
  authRoutes(router);
  alertsRoutes(router);
  bitReportRoutes(router);
  calibrationRoutes(router);
  explanationRoutes(router);
  healthRoutes(router);
  DashboardRoutes(router);
  loggerRoutes(router);
  mapsRoutes(router);
  polygonsRoutes(router);
  systemInfoRoutes(router);
  systemProductsRoutes(router);
  versionRoutes(router);

  return router;
}