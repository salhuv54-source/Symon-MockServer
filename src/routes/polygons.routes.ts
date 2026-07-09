import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function polygonsRoutes(router: Router): void {

  // GET /api/polygons/bit/:filename/:id/:isExpandBitResultInNewTab
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.BIT}/:filename/:id/:isExpandBitResultInNewTab`,
    (req: Request, res: Response) => {
      const { filename, id, isExpandBitResultInNewTab } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.BIT}/${filename}/${id}/${isExpandBitResultInNewTab} received`);
      res.json({ filename, id, isExpandBitResultInNewTab, data: {} });
    }
  );

  // GET /api/polygons/tree/:filename
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.TREE}/:filename`,
    (req: Request, res: Response) => {
      const { filename } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.TREE}/${filename} received`);
      res.json({ filename, data: {} });
    }
  );

  // GET /api/polygons/system-info/:filename
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.SYSTEM_INFO}/:filename`,
    (req: Request, res: Response) => {
      const { filename } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.SYSTEM_INFO}/${filename} received`);
      res.json({ filename, data: {} });
    }
  );

  // GET /api/polygons/dynamic-diagram/:nodeId
  router.get(
    `${MainRoutes.SERVER_POLYGONS}${SubRoutes.DYNAMIC_DIAGRAM}/:nodeId`,
    (req: Request, res: Response) => {
      const { nodeId } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SERVER_POLYGONS}${SubRoutes.DYNAMIC_DIAGRAM}/${nodeId} received`);
      res.json({ nodeId, data: {} });
    }
  );
}