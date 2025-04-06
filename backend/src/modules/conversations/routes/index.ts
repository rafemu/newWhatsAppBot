import { Router } from 'express';
import { conversationRoutes } from './conversationRoutes';

export const setupConversationsRoutes = (): Router => {
  const router = Router();
  router.use('/', conversationRoutes);
  return router;
}; 