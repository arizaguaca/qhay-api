import { Router } from 'express';
import { CustomerFavoriteController } from '../controllers/customer-favorite-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';

export function createCustomerFavoriteRoutes(favoriteController: CustomerFavoriteController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // All favorites endpoints require authentication
  router.use(authMiddleware.authenticate);

  router.post('/toggle', favoriteController.toggle.bind(favoriteController));
  router.get('/customer/:customerId', favoriteController.fetchByCustomerId.bind(favoriteController));

  return router;
}
