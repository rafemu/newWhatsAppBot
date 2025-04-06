import { Router } from 'express';
import { authRoutes } from './authRoutes';

export { authRoutes };

export const setupAuthRoutes = (): Router => {
  return authRoutes;
}; 