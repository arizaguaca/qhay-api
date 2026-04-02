import { Router } from 'express';
import { MenuController } from '../controllers/menu-controller';

export function createMenuRoutes(menuController: MenuController): Router {
  const router = Router();

  router.post('/', menuController.create.bind(menuController));
  router.get('/:id', menuController.getById.bind(menuController));
  router.get('/restaurant/:restaurantId', menuController.fetchByRestaurantId.bind(menuController));
  router.put('/:id', menuController.update.bind(menuController));
  router.delete('/:id', menuController.delete.bind(menuController));

  return router;
}