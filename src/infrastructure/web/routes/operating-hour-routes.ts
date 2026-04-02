import { Router } from 'express';
import { OperatingHourController } from '../controllers/operating-hour-controller';

export function createOperatingHourRoutes(operatingHourController: OperatingHourController): Router {
  const router = Router();

  router.post('/:restaurantId/hours', operatingHourController.saveHours.bind(operatingHourController));
  router.get('/:restaurantId/hours', operatingHourController.getByRestaurantId.bind(operatingHourController));

  return router;
}