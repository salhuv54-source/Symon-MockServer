import { Router, Request, Response } from 'express';
import { MainRoutes, SubRoutes } from '../types';

export default function authRoutes(router: Router): void {

  // POST /api/login/
  router.post(
    `${MainRoutes.LOGIN}${SubRoutes.MAIN}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] POST ${MainRoutes.LOGIN}${SubRoutes.MAIN} received`);
      res.json({ token: 'mock-token', user: { name: 'Mock User' } });
    }
  );

  // POST /api/loginvalidateToken
  router.post(
    `${MainRoutes.LOGIN}${SubRoutes.VALIDATE_TOKEN}`,
    (req: Request, res: Response) => {
      console.log(`[RouteService] POST ${MainRoutes.LOGIN}${SubRoutes.VALIDATE_TOKEN} received`);
      res.json({ valid: true, user: { name: 'Mock User' } });
    }
  );
}
