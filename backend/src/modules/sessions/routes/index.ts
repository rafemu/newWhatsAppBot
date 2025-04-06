import { Router } from 'express';
import { sessionRoutes } from './sessionRoutes';

export const setupSessionsRoutes = (): Router => {
  const router = Router();
  router.use('/', sessionRoutes);
  return router;
}; 