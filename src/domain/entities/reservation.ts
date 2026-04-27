export interface Reservation {
  id: string;
  customerId: string;
  restaurantId: string;
  tableNumber: number;
  reservationDate: Date;
  guests: number;
  status: string; // pending, confirmed, cancelled, completed
  cancelledBy?: 'customer' | 'staff' | 'system' | null;
  cancellationReason?: string | null;
  cancelledByUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ReservationStatus = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
  Completed: 'completed',
} as const;