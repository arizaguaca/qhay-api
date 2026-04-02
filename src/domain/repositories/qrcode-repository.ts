import { QRCode } from '../entities/qrcode';

export interface QRCodeRepository {
  create(qrCode: QRCode): Promise<void>;
  getById(id: string): Promise<QRCode | null>;
  getByRestaurantId(restaurantId: string): Promise<QRCode[]>;
  getByTableNumber(restaurantId: string, tableNumber: number): Promise<QRCode | null>;
  delete(id: string): Promise<void>;
}