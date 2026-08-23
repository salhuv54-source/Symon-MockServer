import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../interfaces/routes.interface';
import { getEventsAndFaultsForSystem } from '../system-log.service';

export default function loggerRoutes(router: Router): void {

  // GET /api/log
  router.get(
    `${MainRoutes.LOGGER}${SubRoutes.MAIN}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.LOGGER}${SubRoutes.MAIN} received`);
      const selectedSystemId = req.query.SelectedSystemId || req.query.selectedSystemId || req.query.systemId || req.query.nodeId || req.query.id;
      const result = getEventsAndFaultsForSystem(selectedSystemId);
      res.json({ message: 'Logger endpoint', SelectedSystemId: selectedSystemId, ...result });
    }
  );

  // POST /api/log
  router.post(
    `${MainRoutes.LOGGER}${SubRoutes.MAIN}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] POST ${MainRoutes.LOGGER}${SubRoutes.MAIN} received`);
      const selectedSystemId = req.body?.SelectedSystemId || req.body?.selectedSystemId || req.body?.systemId || req.body?.nodeId || req.body?.id;
      const result = getEventsAndFaultsForSystem(selectedSystemId);
      res.json({ message: 'Logger endpoint', SelectedSystemId: selectedSystemId, ...result });
    }
  );

  // GET /api/system-log
  router.get(
    MainRoutes.GET_ALL_SYSTEM_LOG,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.GET_ALL_SYSTEM_LOG} received`);
      const selectedSystemId = req.query.SelectedSystemId || req.query.selectedSystemId || req.query.systemId || req.query.nodeId || req.query.id;
      const result = getEventsAndFaultsForSystem(selectedSystemId);
      res.json({ SelectedSystemId: selectedSystemId, ...result });
    }
  );

  // GET /api/system-log/:selectedSystemId
  router.get(
    `${MainRoutes.GET_ALL_SYSTEM_LOG}/:selectedSystemId`,
    (req: Request, res: Response) => {
      const { selectedSystemId } = req.params;
      console.log(`[RouteService] GET ${MainRoutes.GET_ALL_SYSTEM_LOG}/${selectedSystemId} received`);
      const result = getEventsAndFaultsForSystem(selectedSystemId);
      res.json({ SelectedSystemId: selectedSystemId, ...result });
    }
  );

  // POST /api/system-log
  router.post(
    MainRoutes.GET_ALL_SYSTEM_LOG,
    (req: Request, res: Response) => {
      console.log(`[RouteService] POST ${MainRoutes.GET_ALL_SYSTEM_LOG} received`);
      const selectedSystemId = req.body?.SelectedSystemId || req.body?.selectedSystemId || req.body?.systemId || req.body?.nodeId || req.body?.id;
      const result = getEventsAndFaultsForSystem(selectedSystemId);
      res.json({ SelectedSystemId: selectedSystemId, ...result });
    }
  );
}