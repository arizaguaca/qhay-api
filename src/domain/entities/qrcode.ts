export interface QRCode {
  id: string;
  restaurantId: string;
  tableNumber: number;
  label: string;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}