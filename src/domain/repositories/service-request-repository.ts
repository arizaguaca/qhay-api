import { ServiceRequest } from '../entities/service-request';

export interface ServiceRequestRepository {
  create(request: ServiceRequest): Promise<void>;
  updateStatus(id: string, status: 'pending' | 'resolved'): Promise<void>;
  getByRestaurantId(restaurantId: string, status?: 'pending' | 'resolved'): Promise<ServiceRequest[]>;
  getByCustomerId(customerId: string, status?: 'pending' | 'resolved'): Promise<ServiceRequest[]>;
}
