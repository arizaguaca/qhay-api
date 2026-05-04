export interface ServiceRequest {
  id: string;
  restaurantId: string;
  tableNumber: number;
  customerId?: string | null;
  status: 'pending' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}
