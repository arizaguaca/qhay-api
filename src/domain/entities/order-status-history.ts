export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: string;
  changedAt: Date;
  changedByUserId?: string | null;
}
