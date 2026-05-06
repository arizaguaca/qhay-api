import { v4 as uuidv4 } from 'uuid';
import { ServiceRequest } from '../../domain/entities/service-request';
import { ServiceRequestRepository } from '../../domain/repositories/service-request-repository';
import { SocketEmitter } from '../../infrastructure/socket/socket-emitter';

export class ServiceRequestUseCaseImpl {
  constructor(private repo: ServiceRequestRepository) {}

  async create(request: ServiceRequest): Promise<void> {
    if (!request.id) {
      request.id = uuidv4();
    }
    request.status = 'pending';
    request.createdAt = new Date();
    request.updatedAt = new Date();

    await this.repo.create(request);

    // Notify via Socket
    SocketEmitter.notifyCallWaiter(request.restaurantId, {
      tableNumber: request.tableNumber,
      requestId: request.id
    });
  }

  async updateStatus(id: string, status: 'pending' | 'resolved'): Promise<void> {
    await this.repo.updateStatus(id, status);
  }

  async getByRestaurantId(restaurantId: string, status?: 'pending' | 'resolved'): Promise<ServiceRequest[]> {
    return await this.repo.getByRestaurantId(restaurantId, status);
  }

  async getByCustomerId(customerId: string, status?: 'pending' | 'resolved'): Promise<ServiceRequest[]> {
    return await this.repo.getByCustomerId(customerId, status);
  }
}
