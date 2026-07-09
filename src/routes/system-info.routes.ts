import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';
import appStore from '../app-store';

export default function systemInfoRoutes(router: Router): void {

    // GET /api/system-info-list/updateFavorite/:uniqueIdWithoutDate
  router.get(
    `${MainRoutes.SYSTEM_INFO_LIST}${SubRoutes.UPDATE_FAVORITE}/:uniqueIdWithoutDate`,
    (req: Request, res: Response) => {
      const { uniqueIdWithoutDate } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.SYSTEM_INFO_LIST}${SubRoutes.UPDATE_FAVORITE}/${uniqueIdWithoutDate} received`);
      res.json({ uniqueIdWithoutDate, updated: true });
    }
  );
}