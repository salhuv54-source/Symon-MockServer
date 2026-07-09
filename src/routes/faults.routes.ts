import { Router, Request, Response } from 'express';
import { MainRoutes } from '../types';
import appStore from '../app-store';

export default function faultsRoutes(router: Router): void {
  // GET /api/faults
  router.get(MainRoutes.GET_FAULTS, (req: Request, res: Response) => {
    console.log(`[RouteService] GET ${MainRoutes.GET_FAULTS} received`);
    const modelNames = appStore.getModelNames();
    const faults = modelNames.flatMap(name => {
      const model = appStore.getModel(name);
      return model ? model.faults : [];
    });
    res.json({ faults });
  });
}