import { Reservation } from '../entities/reservation';

export interface ReservationRepository {
  create(reservation: Reservation): Promise<void>;
  getById(id: string): Promise<Reservation | null>;
  fetchByRestaurantId(restaurantId: string): Promise<Reservation[]>;
  fetchByUserId(userId: string): Promise<Reservation[]>;
  updateStatus(id: string, status: string): Promise<void>;
  update(reservation: Reservation): Promise<void>;
}