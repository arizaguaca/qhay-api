import { Router } from 'express';
import { UserController } from '../controllers/user-controller';

export function createUserRoutes(userController: UserController): Router {
  const router = Router();

  router.post('/', userController.create.bind(userController));
  router.post('/login', userController.login.bind(userController));
  router.get('/', userController.fetch.bind(userController));
  router.get('/:id', userController.getById.bind(userController));
  router.get('/email/:email', userController.getByEmail.bind(userController));
  router.get('/phone/:phone', userController.getByPhone.bind(userController));
  router.get('/staff/:restaurantId', userController.getStaffByRestaurant.bind(userController));
  router.put('/:id', userController.update.bind(userController));
  router.delete('/:id', userController.delete.bind(userController));

  return router;
}