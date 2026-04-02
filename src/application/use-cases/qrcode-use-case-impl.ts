import { v4 as uuidv4 } from 'uuid';
import { QRCode } from '../../domain/entities/qrcode';
import { QRCodeRepository } from '../../domain/repositories/qrcode-repository';

export class QRCodeUseCaseImpl {
  constructor(private qrCodeRepo: QRCodeRepository) {}

  async generate(restaurantId: string, tableNumber: number): Promise<QRCode> {
    const code = uuidv4(); // or some other unique code
    const qrCode: QRCode = {
      id: uuidv4(),
      restaurantId,
      tableNumber,
      label: `Table ${tableNumber}`,
      code,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.qrCodeRepo.create(qrCode);
    return qrCode;
  }

  async generateImage(code: string): Promise<Buffer> {
    // Stub: in real implementation, use qrcode library
    // const qr = require('qrcode');
    // return await qr.toBuffer(code);
    throw new Error('Not implemented');
  }

  async getById(id: string): Promise<QRCode | null> {
    return await this.qrCodeRepo.getById(id);
  }

  async getByRestaurantId(restaurantId: string): Promise<QRCode[]> {
    return await this.qrCodeRepo.getByRestaurantId(restaurantId);
  }

  async delete(id: string): Promise<void> {
    await this.qrCodeRepo.delete(id);
  }
}