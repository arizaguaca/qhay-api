import { Router } from 'express';
import { OrderReviewController } from '../controllers/order-review-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';

export function createOrderReviewRoutes(orderReviewController: OrderReviewController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // All reviews endpoints require authentication
  router.use(authMiddleware.authenticate);

  router.post('/', orderReviewController.create.bind(orderReviewController));
  router.get('/order/:orderId', orderReviewController.getByOrderId.bind(orderReviewController));
  router.get('/restaurant/:restaurantId', orderReviewController.fetchByRestaurantId.bind(orderReviewController));
  router.get('/customer/:customerId', orderReviewController.fetchByCustomerId.bind(orderReviewController));

  return router;
}
