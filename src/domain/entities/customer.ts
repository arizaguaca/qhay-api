export interface Customer {
  id: string;
  fullName?: string;
  phone: string;
  isActive?: boolean;
  allowPromotions?: boolean;
  promotionsUpdatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}