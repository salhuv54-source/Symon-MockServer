import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function bitReportRoutes(router: Router): void {

  // GET /api/bit-report-files/bit-report-log-click
  router.get(
    `${MainRoutes.SERVER_BIT_REPORT_FILES}${SubRoutes.BIT_REPORT_LOG_CLICK}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.SERVER_BIT_REPORT_FILES}${SubRoutes.BIT_REPORT_LOG_CLICK} received`);
      res.json({ message: 'Bit report log click' });
    }
  );

  // GET /api/bit-report-files/bit-report-tre-map-click
  router.get(
    `${MainRoutes.SERVER_BIT_REPORT_FILES}${SubRoutes.BIT_REPORT_TREE_MAP_CLICK}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.SERVER_BIT_REPORT_FILES}${SubRoutes.BIT_REPORT_TREE_MAP_CLICK} received`);
      res.json({ message: 'Bit report tree map click' });
    }
  );
}