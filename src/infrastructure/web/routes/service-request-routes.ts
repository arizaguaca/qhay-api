import { Router } from 'express';
import { ServiceRequestController } from '../controllers/service-request-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';

export function createServiceRequestRoutes(controller: ServiceRequestController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  const staffRoles = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.WAITER, Role.COOK, Role.CASHIER];

  // Create service request: any authenticated user/customer
  router.post('/', authMiddleware.authenticate, controller.create.bind(controller));

  // Update status: restricted to staff
  router.put('/:id/status', authMiddleware.authenticate, authMiddleware.authorize(staffRoles), controller.updateStatus.bind(controller));
  
  return router;
}
