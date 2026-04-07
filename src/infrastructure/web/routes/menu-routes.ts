import { Router } from 'express';
import { MenuController } from '../controllers/menu-controller';
import { uploadMenuImage } from '../middlewares/upload-menu-image';

export function createMenuRoutes(menuController: MenuController): Router {
  const router = Router();

  router.post('/', uploadMenuImage, menuController.create.bind(menuController));
  router.get('/:id', menuController.getById.bind(menuController));
  router.get('/restaurant/:restaurantId', menuController.fetchByRestaurantId.bind(menuController));
  router.put('/:id', uploadMenuImage, menuController.update.bind(menuController));
  router.delete('/:id', menuController.delete.bind(menuController));

  // Category routes
  router.post('/categories', menuController.createCategory.bind(menuController));
  router.get('/categories/restaurant/:restaurantId', menuController.fetchCategories.bind(menuController));

  return router;
}