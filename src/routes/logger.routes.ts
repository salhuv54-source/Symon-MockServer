import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function loggerRoutes(router: Router): void {

  // GET /api/log/
  router.get(
    `${MainRoutes.LOGGER}${SubRoutes.MAIN}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.LOGGER}${SubRoutes.MAIN} received`);
      res.json({ message: 'Logger endpoint', logs: [] });
    }
  );
}