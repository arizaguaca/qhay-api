import { Router } from 'express';
import { OperatingHourController } from '../controllers/operating-hour-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';

export function createOperatingHourRoutes(operatingHourController: OperatingHourController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  const writeRoles = [Role.OWNER, Role.ADMIN, Role.MANAGER];

  // Save/Update hours (restricted to Owner/Admin/Manager)
  router.post('/:restaurantId/hours', authMiddleware.authenticate, authMiddleware.authorize(writeRoles), operatingHourController.saveHours.bind(operatingHourController));
  router.put('/:restaurantId/hours', authMiddleware.authenticate, authMiddleware.authorize(writeRoles), operatingHourController.saveHours.bind(operatingHourController));

  // Read hours (authenticated: customer & staff)
  router.get('/:restaurantId/hours', authMiddleware.authenticate, operatingHourController.getByRestaurantId.bind(operatingHourController));

  return router;
}