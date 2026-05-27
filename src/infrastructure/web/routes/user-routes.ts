import { Router } from 'express';
import { UserController } from '../controllers/user-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';

export function createUserRoutes(userController: UserController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Public endpoints
  router.post('/', userController.create.bind(userController));
  router.post('/login', userController.login.bind(userController));

  // Authenticated endpoints
  router.post('/logout', authMiddleware.authenticate, userController.logout.bind(userController));

  // Staff management (restricted to owners, admins, managers)
  const staffManagers = [Role.OWNER, Role.ADMIN, Role.MANAGER];
  router.post('/staff', authMiddleware.authenticate, authMiddleware.authorize(staffManagers), userController.createStaff.bind(userController));
  router.put('/staff/:id', authMiddleware.authenticate, authMiddleware.authorize(staffManagers), userController.updateStaff.bind(userController));
  router.delete('/staff/:id', authMiddleware.authenticate, authMiddleware.authorize(staffManagers), userController.deleteStaff.bind(userController));

  // Staff querying (accessible by any staff member of the restaurant)
  const allStaffAndOwners = [Role.OWNER, Role.ADMIN, Role.MANAGER, Role.WAITER, Role.COOK, Role.CASHIER];
  router.get('/staff/:restaurantId', authMiddleware.authenticate, authMiddleware.authorize(allStaffAndOwners), userController.getStaffByRestaurant.bind(userController));

  // User management (mostly admin/owner/manager or specific roles)
  router.get('/', authMiddleware.authenticate, authMiddleware.authorize([Role.ADMIN]), userController.fetch.bind(userController));
  router.get('/:id', authMiddleware.authenticate, authMiddleware.authorize(allStaffAndOwners), userController.getById.bind(userController));
  router.get('/email/:email', authMiddleware.authenticate, authMiddleware.authorize(allStaffAndOwners), userController.getByEmail.bind(userController));
  router.get('/phone/:phone', authMiddleware.authenticate, authMiddleware.authorize(allStaffAndOwners), userController.getByPhone.bind(userController));
  router.put('/:id', authMiddleware.authenticate, authMiddleware.authorize([Role.OWNER, Role.ADMIN, Role.MANAGER]), userController.update.bind(userController));
  router.delete('/:id', authMiddleware.authenticate, authMiddleware.authorize([Role.OWNER, Role.ADMIN]), userController.delete.bind(userController));

  return router;
}