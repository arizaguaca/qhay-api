import { Router } from 'express';
import { ReservationController } from '../controllers/reservation-controller';

export function createReservationRoutes(reservationController: ReservationController): Router {
  const router = Router();

  router.post('/', reservationController.create.bind(reservationController));
  router.get('/:id', reservationController.getById.bind(reservationController));
  // Add more routes as needed

  return router;
}