import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant-controller';
import { uploadLogo } from '../middlewares/upload-logo';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';
import { TokenService } from '../../../application/services/token-service';

export function createRestaurantRoutes(
  restaurantController: RestaurantController,
  authMiddleware: AuthMiddleware,
  tokenService: TokenService
): Router {
  const router = Router();

  // Get temporary token for public menu customer
  router.get('/:restaurantId/public-token', (req, res) => {
    try {
      const { restaurantId } = req.params;
      if (!restaurantId) {
        res.status(400).json({ error: 'Restaurant ID is required' });
        return;
      }

      // Generate a customer JWT valid for public viewing
      const token = tokenService.generateToken({
        userId: 'anonymous_customer',
        role: 'customer',
        restaurantId: restaurantId,
      });

      res.json({ token });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

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