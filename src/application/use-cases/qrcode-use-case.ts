import { QRCode } from '../../domain/entities/qrcode';

export interface QRCodeUseCase {
  generate(restaurantId: string, tableNumber: number): Promise<QRCode>;
  generateImage(code: string): Promise<Buffer>;
  getById(id: string): Promise<QRCode | null>;
  getByRestaurantId(restaurantId: string): Promise<QRCode[]>;
  delete(id: string): Promise<void>;
}