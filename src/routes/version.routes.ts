import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function versionRoutes(router: Router): void {
  // GET /version/
  router.get(
    `${MainRoutes.VERSION}${SubRoutes.MAIN}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.VERSION}${SubRoutes.MAIN} received`);
      res.json({ version: '1.0.0', build: 'mock-build' });
    }
  );
}