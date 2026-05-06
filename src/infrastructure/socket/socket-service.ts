import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private static instance: SocketService;
  private io: SocketServer | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(server: HttpServer): void {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*', // En producción, ajustar al dominio del frontend
        methods: ['GET', 'POST'],
      },
      // Optimización para Hostinger (Hosting Compartido)
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEvents();

    console.log('✅ Socket.io initialized with resilience settings for Shared Hosting.');
  }

  private setupMiddleware(): void {
    this.io?.use((socket: Socket, next) => {
      const restaurantId = socket.handshake.query.restaurantId || socket.handshake.auth.restaurantId;

      if (!restaurantId) {
        return next(new Error('Authentication error: restaurantId is required'));
      }

      // Adjuntar restaurantId al socket para uso posterior
      (socket as any).restaurantId = restaurantId;
      next();
    });
  }

  private setupEvents(): void {
    this.io?.on('connection', (socket: Socket) => {
      const restaurantId = (socket as any).restaurantId;
      const room = `restaurant_${restaurantId}`;

      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);

      socket.on('disconnect', () => {
        console.log(`🔌 Socket ${socket.id} disconnected`);
      });
    });
  }

  /**
   * Emite un evento a una sala específica de restaurante.
   */
  public emitToRestaurant(restaurantId: string, event: string, data: any): void {
    if (!this.io) {
      console.error('❌ Cannot emit event: Socket.io not initialized');
      return;
    }
    const room = `restaurant_${restaurantId}`;
    this.io.to(room).emit(event, data);
    console.log(`📢 Event [${event}] emitted to room [${room}]`);
  }
}
