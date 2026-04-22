import { Router } from 'express';
import { CuisineTypeController } from '../controllers/cuisine-type-controller';

export function createCuisineTypeRoutes(cuisineTypeController: CuisineTypeController): Router {
  const router = Router();
  router.get('/', cuisineTypeController.fetchAll.bind(cuisineTypeController));
  router.get('/owner/:ownerId', cuisineTypeController.fetchByOwner.bind(cuisineTypeController));
  router.post('/', cuisineTypeController.create.bind(cuisineTypeController));
  router.delete('/:id', cuisineTypeController.delete.bind(cuisineTypeController));
  return router;
}
