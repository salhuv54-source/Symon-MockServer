import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function mapsRoutes(router: Router): void {
  // GET /api/maps/bit/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.BIT}/:filename`,
    (req: Request, res: Response) => {
      const { filename } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.BIT}/${filename} received`);
      res.json({ filename, data: {} });
    }
  );

  // GET /api/maps/tree/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.TREE}/:filename`,
    (req: Request, res: Response) => {
      const { filename } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.TREE}/${filename} received`);
      res.json({ filename, data: {} });
    }
  );

  // GET /api/maps/system-info/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.SYSTEM_INFO}/:filename`,
    (req: Request, res: Response) => {
      const { filename } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.SYSTEM_INFO}/${filename} received`);
      res.json({ filename, data: {} });
    }
  );

  // GET /api/maps/dynamic-diagram/:filename
  router.get(
    `${MainRoutes.SERVER_MAPS}${SubRoutes.DYNAMIC_DIAGRAM}/:filename`,
    (req: Request, res: Response) => {
      const { filename } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_MAPS}${SubRoutes.DYNAMIC_DIAGRAM}/${filename} received`);
      res.json({ filename, data: {} });
    }
  );
}