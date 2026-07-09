import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function explanationRoutes(router: Router): void {
  // GET /api/explanation/serviceability/:nodeId
  router.get(
    `${MainRoutes.EXPLANATION}${SubRoutes.SERVICEABILITY}/:nodeId`,
    (req: Request, res: Response) => {
      const { nodeId } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.EXPLANATION}${SubRoutes.SERVICEABILITY}/${nodeId} received`);
      res.json({ nodeId, explanation: '' });
    }
  );

  // GET /api/explanation/fault/:uniqueId
  router.get(
    `${MainRoutes.EXPLANATION}${SubRoutes.FAULT}/:uniqueId`,
    (req: Request, res: Response) => {
      const { uniqueId } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.EXPLANATION}${SubRoutes.FAULT}/${uniqueId} received`);
      res.json({ uniqueId, explanation: '' });
    }
  );

  // GET /api/explanation/event/:uniqueId
  router.get(
    `${MainRoutes.EXPLANATION}${SubRoutes.EVENT}/:uniqueId`,
    (req: Request, res: Response) => {
      const { uniqueId } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.EXPLANATION}${SubRoutes.EVENT}/${uniqueId} received`);
      res.json({ uniqueId, explanation: '' });
    }
  );
}