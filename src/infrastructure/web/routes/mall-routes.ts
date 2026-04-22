import { Router } from 'express';
import { MallController } from '../controllers/mall-controller';

export function createMallRoutes(mallController: MallController): Router {
  const router = Router();
  router.get('/', mallController.fetch.bind(mallController));
  return router;
}
