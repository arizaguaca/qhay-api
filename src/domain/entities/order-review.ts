export interface OrderReview {
  id: string;
  orderId: string;
  restaurantId: string;
  customerId: string;
  overallRating: number;
  comment?: string | null;
  wantsContact: boolean;
  contactStatus?: 'not_required' | 'pending' | 'contacted' | 'resolved';
  resolutionComment?: string | null;
  serviceRating?: number | null;
  foodRating?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
