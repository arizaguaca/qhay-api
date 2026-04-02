import { Router } from 'express';
import { CustomerController } from '../controllers/customer-controller';

export function createCustomerRoutes(customerController: CustomerController): Router {
  const router = Router();

  router.post('/', customerController.create.bind(customerController));
  router.get('/:id', customerController.getById.bind(customerController));
  router.get('/phone/:phone', customerController.getByPhone.bind(customerController));
  router.put('/:id', customerController.update.bind(customerController));

  return router;
}