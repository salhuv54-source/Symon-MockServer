import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function DashboardRoutes(router: Router): void {

  // GET /api/dashboard/symon-data-mapper/:nodeId
  router.get(
    `${MainRoutes.DASHBOARD}${SubRoutes.SYMON_DATA_MAPPER}/:nodeId`,
    (req: Request, res: Response) => {
      const { nodeId } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.DASHBOARD}${SubRoutes.SYMON_DATA_MAPPER}/${nodeId} received`);
      res.json({ nodeId, data: {} });
    }
  );
}