import { Request, Response } from 'express';
import { ReservationUseCaseImpl } from '../../../application/use-cases/reservation-use-case-impl';

export class ReservationController {
  constructor(private reservationUseCase: ReservationUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const reservation = req.body;
      await this.reservationUseCase.create(reservation);
      res.status(201).json({ message: 'Reservation created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const reservation = await this.reservationUseCase.getById(id);
      if (!reservation) {
        res.status(404).json({ error: 'Reservation not found' });
        return;
      }
      res.json(reservation);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetchByRestaurantId(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const reservations = await this.reservationUseCase.fetchByRestaurantId(restaurantId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetchByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const reservations = await this.reservationUseCase.fetchByCustomerId(customerId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await this.reservationUseCase.updateStatus(id, status);
      res.json({ message: 'Reservation status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}