import { Router } from 'express';
import { ServiceRequestController } from '../controllers/service-request-controller';

export function createServiceRequestRoutes(controller: ServiceRequestController): Router {
  const router = Router();

  router.post('/', controller.create.bind(controller));
  router.put('/:id/status', controller.updateStatus.bind(controller));
  
  return router;
}
