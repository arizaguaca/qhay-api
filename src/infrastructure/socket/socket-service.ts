import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { JwtTokenService } from '../security/jwt-token-service';
import { loadConfig } from '../../config/config';

export class SocketService {
  private static instance: SocketService;
  private io: SocketServer | null = null;
  private tokenService: JwtTokenService;

  private constructor() {
    const config = loadConfig();
    this.tokenService = new JwtTokenService(config.jwtSecret, config.jwtExpiration);
  }

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
      let token = socket.handshake.auth.token || socket.handshake.query.token;

      // Intentar obtener el token de las cookies del handshake si no viene en auth/query
      if (!token && socket.handshake.headers.cookie) {
        const cookieToken = socket.handshake.headers.cookie
          .split(';')
          .map(c => c.trim())
          .find(c => c.startsWith('token='));
        if (cookieToken) {
          token = cookieToken.split('=')[1];
        }
      }

      // Evitar que strings literales como "null" o "undefined" sean tratados como tokens válidos
      if (token === 'null' || token === 'undefined') {
        token = undefined;
      }

      // Todos los accesos a WebSocket ahora requieren obligatoriamente un token JWT válido
      if (!token) {
        return next(new Error('Authentication error: Token is required to connect'));
      }

      const payload = this.tokenService.verifyToken(token);
      if (!payload) {
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      // El restaurantId se extrae exclusivamente del JWT verificado (Seguridad Absoluta)
      (socket as any).restaurantId = payload.restaurantId;
      (socket as any).userId = payload.userId;
      (socket as any).role = payload.role;
      (socket as any).isPublicCustomer = payload.role === 'customer';

      console.log(`🔐 Socket ${socket.id} authenticated via JWT for Restaurant Room: ${(socket as any).restaurantId} (Role: ${payload.role})`);
      return next();
    });
  }

  private setupEvents(): void {
    this.io?.on('connection', (socket: Socket) => {
      const restaurantId = (socket as any).restaurantId;
      const room = `restaurant_${restaurantId}`;

      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);

      // Registrar entrada a sala privada de cliente
      socket.on('join_customer', (customerId: string) => {
        if (!customerId) return;
        const customerRoom = `customer_${customerId}`;
        socket.join(customerRoom);
        console.log(`👤 Socket ${socket.id} joined customer room: ${customerRoom}`);
      });

      // Registrar salida de sala privada de cliente
      socket.on('leave_customer', (customerId: string) => {
        if (!customerId) return;
        const customerRoom = `customer_${customerId}`;
        socket.leave(customerRoom);
        console.log(`👤 Socket ${socket.id} left customer room: ${customerRoom}`);
      });

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

  /**
   * Emite un evento a la sala privada de un cliente.
   */
  public emitToCustomer(customerId: string, event: string, data: any): void {
    if (!this.io) {
      console.error('❌ Cannot emit event: Socket.io not initialized');
      return;
    }
    const customerRoom = `customer_${customerId}`;
    this.io.to(customerRoom).emit(event, data);
    console.log(`📢 Target Event [${event}] emitted specifically to customer room [${customerRoom}]`);
  }
}
