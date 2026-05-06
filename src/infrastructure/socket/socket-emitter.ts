import { SocketService } from './socket-service';

export class SocketEmitter {
  private static service = SocketService.getInstance();

  /**
   * Notifica a la cocina cuando un pedido entra en estado 'pending'.
   */
  public static notifyNewOrder(restaurantId: string, order: any): void {
    this.service.emitToRestaurant(restaurantId, 'new_order', {
      message: '¡Nuevo pedido recibido!',
      order,
    });
  }

  /**
   * Notifica a los meseros cuando una mesa solicita asistencia.
   */
  public static notifyCallWaiter(restaurantId: string, data: { tableNumber: number; requestId: string }): void {
    this.service.emitToRestaurant(restaurantId, 'call_waiter', {
      message: `Asistencia solicitada en la mesa ${data.tableNumber}`,
      ...data,
    });
  }

  /**
   * Notifica cambios en la disponibilidad del menú.
   */
  public static notifyMenuUpdate(restaurantId: string, itemUpdate: { menuItemId: string; isAvailable: boolean }): void {
    this.service.emitToRestaurant(restaurantId, 'menu_update', {
      message: 'Actualización de disponibilidad de menú',
      ...itemUpdate,
    });
  }

  /**
   * Notifica actualizaciones de estado de pedidos (opcional, útil para el cliente).
   */
  public static notifyOrderStatusUpdate(restaurantId: string, orderId: string, status: string): void {
    this.service.emitToRestaurant(restaurantId, 'order_status_update', {
      orderId,
      status,
    });
  }
}
