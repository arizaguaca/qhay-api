import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant-controller';

export function createRestaurantRoutes(restaurantController: RestaurantController): Router {
  const router = Router();

  router.post('/', restaurantController.create.bind(restaurantController));
  router.get('/', restaurantController.fetch.bind(restaurantController));
  router.get('/:id', restaurantController.getById.bind(restaurantController));
  router.get('/owner/:ownerId', restaurantController.getByOwnerId.bind(restaurantController));
  router.put('/:id', restaurantController.update.bind(restaurantController));

  return router;
}