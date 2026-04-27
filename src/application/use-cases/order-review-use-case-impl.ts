import { v4 as uuidv4 } from 'uuid';
import { OrderReview } from '../../domain/entities/order-review';
import { OrderReviewRepository } from '../../domain/repositories/order-review-repository';

export class OrderReviewUseCaseImpl {
  constructor(private orderReviewRepo: OrderReviewRepository) {}

  async create(review: OrderReview): Promise<void> {
    if (!review.id) {
      review.id = uuidv4();
    }
    review.wantsContact = review.wantsContact ?? false;
    review.contactStatus = review.wantsContact ? 'pending' : 'not_required';
    review.createdAt = new Date();
    review.updatedAt = new Date();
    await this.orderReviewRepo.create(review);
  }

  async getByOrderId(orderId: string): Promise<OrderReview | null> {
    return await this.orderReviewRepo.getByOrderId(orderId);
  }

  async fetchByRestaurantId(restaurantId: string): Promise<OrderReview[]> {
    return await this.orderReviewRepo.fetchByRestaurantId(restaurantId);
  }

  async fetchByCustomerId(customerId: string): Promise<OrderReview[]> {
    return await this.orderReviewRepo.fetchByCustomerId(customerId);
  }
}
