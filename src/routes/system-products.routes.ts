import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function systemProductsRoutes(router: Router): void {
  // GET /api/system-products
  router.get(MainRoutes.SYSTEM_PRODUCTS, (req: Request, res: Response) => {
    console.log(`[RouteService] GET ${MainRoutes.SYSTEM_PRODUCTS} received`);
    res.json({ systemProducts: [] });
  });

  // GET /api/system-products/
  router.get(
    `${MainRoutes.SYSTEM_PRODUCTS}${SubRoutes.MAIN}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.SYSTEM_PRODUCTS}${SubRoutes.MAIN} received`);
      res.json({ systemProducts: [] });
    }
  );
}