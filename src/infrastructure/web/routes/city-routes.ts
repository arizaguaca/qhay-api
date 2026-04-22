import { Router } from 'express';
import { CityController } from '../controllers/city-controller';

export function createCityRoutes(cityController: CityController): Router {
  const router = Router();
  router.get('/', cityController.fetchAll.bind(cityController));
  return router;
}
