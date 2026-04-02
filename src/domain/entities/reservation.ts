export interface Reservation {
  id: string;
  userId: string;
  restaurantId: string;
  tableNumber: number;
  reservationDate: Date;
  guests: number;
  status: string; // pending, confirmed, cancelled, completed
  createdAt: Date;
  updatedAt: Date;
}

export const ReservationStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
  Completed: 'completed',
} as const;