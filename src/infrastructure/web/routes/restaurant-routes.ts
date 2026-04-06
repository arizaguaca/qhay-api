import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant-controller';
import { uploadLogo } from '../middlewares/upload-logo';

export function createRestaurantRoutes(restaurantController: RestaurantController): Router {
  const router = Router();

  router.post('/', uploadLogo, restaurantController.create.bind(restaurantController));
  router.get('/', restaurantController.fetch.bind(restaurantController));
  router.get('/:id', restaurantController.getById.bind(restaurantController));
  router.get('/owner/:ownerId', restaurantController.getByOwnerId.bind(restaurantController));
  router.put('/:id', uploadLogo, restaurantController.update.bind(restaurantController));

  return router;
}