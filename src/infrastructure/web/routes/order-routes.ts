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

  // Public endpoint: fetch orders for a specific customer (no staff role required)
  router.get(
    '/customer/:customerId',
    authMiddleware.authenticate,
    orderController.getByCustomer.bind(orderController)
  );

  // View specific order: any authenticated user/customer
  router.get('/:id', authMiddleware.authenticate, orderController.getById.bind(orderController));

  // Get metrics for a restaurant: restricted to staff
  router.get(
    '/restaurant/:restaurantId/metrics',
    authMiddleware.authenticate,
    authMiddleware.authorize(staffRoles),
    orderController.getMetrics.bind(orderController)
  );

  // Update order status: restricted to staff
  router.patch(
    '/:id/status',
    authMiddleware.authenticate,
    authMiddleware.authorize(staffRoles),
    orderController.updateStatus.bind(orderController)
  );

  return router;
}