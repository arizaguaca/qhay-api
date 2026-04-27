import { Reservation } from '../../domain/entities/reservation';

export interface ReservationUseCase {
  create(reservation: Reservation): Promise<void>;
  getById(id: string): Promise<Reservation | null>;
  fetchByRestaurantId(restaurantId: string): Promise<Reservation[]>;
  fetchByCustomerId(customerId: string): Promise<Reservation[]>;
  updateStatus(id: string, status: string): Promise<void>;
}