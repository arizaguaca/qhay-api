export interface QRCode {
  id: string;
  restaurantId: string;
  tableNumber: number;
  label: string;
  slugPath: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}