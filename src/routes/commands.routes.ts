import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function commandsRoutes(router: Router): void {

  // GET /api/commands/run
  router.get(
    `${MainRoutes.COMMANDS}${SubRoutes.RUN_COMMAND}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] GET ${MainRoutes.COMMANDS}${SubRoutes.RUN_COMMAND} received`);
      res.json({ message: 'Run command' });
    }
  );
}
