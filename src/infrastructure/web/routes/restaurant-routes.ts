import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant-controller';
import { uploadLogo } from '../middlewares/upload-logo';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';

export function createRestaurantRoutes(restaurantController: RestaurantController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Create restaurant (Owner/Admin)
  router.post(
    '/',
    authMiddleware.authenticate,
    authMiddleware.authorize([Role.OWNER, Role.ADMIN]),
    uploadLogo,
    restaurantController.create.bind(restaurantController)
  );

  // Read restaurants (Authenticated: customers & staff)
  router.get('/', authMiddleware.authenticate, restaurantController.fetch.bind(restaurantController));
  router.get('/:id', authMiddleware.authenticate, restaurantController.getById.bind(restaurantController));
  
  // View by Owner (Owner/Admin)
  router.get(
    '/owner/:ownerId',
    authMiddleware.authenticate,
    authMiddleware.authorize([Role.OWNER, Role.ADMIN]),
    restaurantController.getByOwnerId.bind(restaurantController)
  );

  // Update restaurant (Owner/Admin/Manager)
  router.put(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize([Role.OWNER, Role.ADMIN, Role.MANAGER]),
    uploadLogo,
    restaurantController.update.bind(restaurantController)
  );

  return router;
}