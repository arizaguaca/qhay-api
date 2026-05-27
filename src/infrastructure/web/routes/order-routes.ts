import { Router } from 'express';
import { OrderController } from '../controllers/order-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';

export function createOrderRoutes(orderController: OrderController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  const staffRoles = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.WAITER, Role.COOK, Role.CASHIER];

  // Create order: any authenticated user/customer
  router.post('/', authMiddleware.authenticate, orderController.create.bind(orderController));

  // Query all orders: restricted to staff
  router.get(
    '/',
    authMiddleware.authenticate,
    authMiddleware.authorize(staffRoles),
    orderController.fetch.bind(orderController)
  );

  // View specific order: any authenticated user/customer
  router.get('/:id', authMiddleware.authenticate, orderController.getById.bind(orderController));

  // Update order status: restricted to staff
  router.patch(
    '/:id/status',
    authMiddleware.authenticate,
    authMiddleware.authorize(staffRoles),
    orderController.updateStatus.bind(orderController)
  );

  return router;
}