import { v4 as uuidv4 } from 'uuid';
import { Reservation } from '../../domain/entities/reservation';
import { ReservationRepository } from '../../domain/repositories/reservation-repository';

export class ReservationUseCaseImpl {
  constructor(private reservationRepo: ReservationRepository) {}

  async create(reservation: Reservation): Promise<void> {
    if (!reservation.id) {
      reservation.id = uuidv4();
    }
    reservation.createdAt = new Date();
    reservation.updatedAt = new Date();

    await this.reservationRepo.create(reservation);
  }

  async getById(id: string): Promise<Reservation | null> {
    return await this.reservationRepo.getById(id);
  }

  async fetchByRestaurantId(restaurantId: string): Promise<Reservation[]> {
    return await this.reservationRepo.fetchByRestaurantId(restaurantId);
  }

  async fetchByUserId(userId: string): Promise<Reservation[]> {
    return await this.reservationRepo.fetchByUserId(userId);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.reservationRepo.updateStatus(id, status);
  }
}