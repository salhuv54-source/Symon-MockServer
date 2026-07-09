import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function esdumpRoutes(router: Router): void {

  // GET /api/esdump/multiexport
  router.get(
    `${MainRoutes.ESDUMP}${SubRoutes.MULTI_EXPORT}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.ESDUMP}${SubRoutes.MULTI_EXPORT} received`);
      res.json({ message: 'Multi export' });
    }
  );

  // GET /api/esdump/multiimport
  router.get(
    `${MainRoutes.ESDUMP}${SubRoutes.MULTI_IMPORT}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.ESDUMP}${SubRoutes.MULTI_IMPORT} received`);
      res.json({ message: 'Multi import' });
    }
  );

  // GET /api/esdump/multidelete
  router.get(
    `${MainRoutes.ESDUMP}${SubRoutes.MULTI_DELETE}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.ESDUMP}${SubRoutes.MULTI_DELETE} received`);
      res.json({ message: 'Multi delete' });
    }
  );
}