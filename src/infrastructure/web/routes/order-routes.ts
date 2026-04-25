import { Router } from 'express';
import { OrderController } from '../controllers/order-controller';

export function createOrderRoutes(orderController: OrderController): Router {
  const router = Router();

  router.post('/', orderController.create.bind(orderController));
  router.get('/', orderController.fetch.bind(orderController));
  router.get('/:id', orderController.getById.bind(orderController));
  router.patch('/:id/status', orderController.updateStatus.bind(orderController));

  return router;
}