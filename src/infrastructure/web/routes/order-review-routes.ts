import { Router } from 'express';
import { OrderReviewController } from '../controllers/order-review-controller';

export function createOrderReviewRoutes(orderReviewController: OrderReviewController): Router {
  const router = Router();

  router.post('/', orderReviewController.create.bind(orderReviewController));
  router.get('/order/:orderId', orderReviewController.getByOrderId.bind(orderReviewController));
  router.get('/restaurant/:restaurantId', orderReviewController.fetchByRestaurantId.bind(orderReviewController));
  router.get('/customer/:customerId', orderReviewController.fetchByCustomerId.bind(orderReviewController));

  return router;
}
