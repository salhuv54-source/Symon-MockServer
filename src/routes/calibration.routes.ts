import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function calibrationRoutes(router: Router): void {
  // GET /api/calibration/calibration-load
  router.get(
    `${MainRoutes.CALIBRATION}${SubRoutes.CALIBRATION_LOAD}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.CALIBRATION}${SubRoutes.CALIBRATION_LOAD} received`);
      res.json({ message: 'Calibration load' });
    }
  );

  // GET /api/calibration/calibration-delete
  router.get(
    `${MainRoutes.CALIBRATION}${SubRoutes.CALIBRATION_DELETE}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.CALIBRATION}${SubRoutes.CALIBRATION_DELETE} received`);
      res.json({ message: 'Calibration delete' });
    }
  );
}