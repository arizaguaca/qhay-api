import { Router } from 'express';
import { MenuController } from '../controllers/menu-controller';
import { uploadMenuImage } from '../middlewares/upload-menu-image';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';

export function createMenuRoutes(menuController: MenuController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  const writeRoles = [Role.OWNER, Role.ADMIN, Role.MANAGER];

  // Write actions (Owner/Admin/Manager)
  router.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.authorize(writeRoles),
    uploadMenuImage,
    menuController.create.bind(menuController)
  );

  router.put(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize(writeRoles),
    uploadMenuImage,
    menuController.update.bind(menuController)
  );

  router.patch(
    '/:id/availability',
    authMiddleware.authenticate,
    authMiddleware.authorize(writeRoles),
    menuController.updateAvailability.bind(menuController)
  );

  router.delete(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize(writeRoles),
    menuController.delete.bind(menuController)
  );

  // Category write action (Owner/Admin/Manager)
  router.post(
    '/categories',
    authMiddleware.authenticate,
    authMiddleware.authorize(writeRoles),
    menuController.createCategory.bind(menuController)
  );

  // Read actions (Authenticated: customers & staff)
  router.get('/:id', authMiddleware.authenticate, menuController.getById.bind(menuController));
  router.get('/restaurant/:restaurantId', authMiddleware.authenticate, menuController.fetchByRestaurantId.bind(menuController));
  router.get('/categories/restaurant/:restaurantId', authMiddleware.authenticate, menuController.fetchCategories.bind(menuController));

  return router;
}