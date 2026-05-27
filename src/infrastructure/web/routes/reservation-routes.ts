import { Router } from 'express';
import { ReservationController } from '../controllers/reservation-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';

export function createReservationRoutes(reservationController: ReservationController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Create reservation: any authenticated user/customer
  router.post('/', authMiddleware.authenticate, reservationController.create.bind(reservationController));

  // View reservation: any authenticated user/customer
  router.get('/:id', authMiddleware.authenticate, reservationController.getById.bind(reservationController));

  return router;
}