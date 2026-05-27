import { Router } from 'express';
import { CustomerController } from '../controllers/customer-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';

export function createCustomerRoutes(customerController: CustomerController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Public: Customer registration/SMS code request
  router.post('/', customerController.create.bind(customerController));

  // Authenticated: View and edit customer details (accessible by the customer or staff)
  router.get('/:id', authMiddleware.authenticate, customerController.getById.bind(customerController));
  router.get('/phone/:phone', authMiddleware.authenticate, customerController.getByPhone.bind(customerController));
  router.put('/:id', authMiddleware.authenticate, customerController.update.bind(customerController));

  return router;
}