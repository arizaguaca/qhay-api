export interface OrderItemModifier {
  id: string;
  orderItemId: string;
  productOptionId: string;
  name: string;
  price: number;
  createdAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  name?: string; // populated from MenuItem
  quantity: number;
  unitPrice: number; // price at the time of order
  notes?: string;
  modifiers?: OrderItemModifier[];
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  tableNumber: number;
  items: OrderItem[];
  status: string; // pending, preparing, ready, delivered, paid, cancelled
  cancelledBy?: 'customer' | 'staff' | 'system' | null;
  totalAmount: number;
  cancellationReason?: string | null;
  cancelledByUserId?: string | null;
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