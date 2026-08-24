import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../interfaces/routes.interface';

export default function DashboardRoutes(router: Router): void {

  // GET /api/dashboard/symon-data-mapper/:nodeId
  router.get(
    `${MainRoutes.DASHBOARD}${SubRoutes.SYMON_DATA_MAPPER}/:nodeId`,
    (req: Request, res: Response) => {
      try {
        const { nodeId } = req.params;
        console.log(`[RouteService] GET ${MainRoutes.DASHBOARD}${SubRoutes.SYMON_DATA_MAPPER}/${nodeId} received`);

        const host = req.get('host') || 'localhost:9001';
        const baseUrl = `${req.protocol}://${host}`;

        res.status(200).json(
          { "Good-Dash": `${baseUrl}/images/success.png`, "Good-Dash-2": `${baseUrl}/images/success.png` }
        );
      }
      catch (e) {
        res.status(400).json({ "Error": "Error in Dashboard supply." });
      }
    }
  );
}
