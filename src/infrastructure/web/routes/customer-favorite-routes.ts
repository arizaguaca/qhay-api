import { Router } from 'express';
import { CustomerFavoriteController } from '../controllers/customer-favorite-controller';

export function createCustomerFavoriteRoutes(favoriteController: CustomerFavoriteController): Router {
  const router = Router();

  router.post('/toggle', favoriteController.toggle.bind(favoriteController));
  router.get('/customer/:customerId', favoriteController.fetchByCustomerId.bind(favoriteController));

  return router;
}
