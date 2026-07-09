import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function healthRoutes(router: Router): void {
  // GET /health
  router.get(MainRoutes.HEALTH, (req: Request, res: Response) => {
    console.log(`[RouteService] GET ${MainRoutes.HEALTH} received`);
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // GET /health/isalive/:serviceName
  router.get(
    `${MainRoutes.HEALTH}${SubRoutes.IS_ALIVE}/:serviceName`,
    (req: Request, res: Response) => {
      const { serviceName } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.HEALTH}${SubRoutes.IS_ALIVE}/${serviceName} received`);
      res.json({ serviceName, alive: true });
    }
  );

  // GET /health/isready
  router.get(
    `${MainRoutes.HEALTH}${SubRoutes.IS_READY}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.HEALTH}${SubRoutes.IS_READY} received`);
      res.json({ ready: true });
    }
  );

  // GET /health/isstarted
  router.get(
    `${MainRoutes.HEALTH}${SubRoutes.IS_STARTED}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.HEALTH}${SubRoutes.IS_STARTED} received`);
      res.json({ started: true });
    }
  );

  // GET /health/metrics
  router.get(
    `${MainRoutes.HEALTH}${SubRoutes.METRICS}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.HEALTH}${SubRoutes.METRICS} received`);
      res.json({ metrics: {} });
    }
  );
}