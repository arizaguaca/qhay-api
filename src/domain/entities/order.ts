export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name?: string; // populated from MenuItem
  quantity: number;
  price: number; // price at the time of order
  notes?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  tableNumber: number;
  items: OrderItem[];
  status: string; // pending, preparing, ready, delivered, paid, cancelled
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export const OrderStatus = {
  Pending: 'pending',
  Preparing: 'preparing',
  Ready: 'ready',
  Delivered: 'delivered',
  Paid: 'paid',
  Cancelled: 'cancelled',
} as const;