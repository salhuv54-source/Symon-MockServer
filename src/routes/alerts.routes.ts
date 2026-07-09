import { Router, Request, Response } from 'express';
import { MainRoutes } from '../types';

export default function alertsRoutes(router: Router): void {
  // GET /api/alerts
  router.get(MainRoutes.ALERTS, (req: Request, res: Response) => {
    console.log(`[RouteService] GET ${MainRoutes.ALERTS} received`);
    res.json({ alerts: [] });
  });
}