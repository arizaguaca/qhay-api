import { v4 as uuidv4 } from 'uuid';
import { QRCode } from '../../domain/entities/qrcode';
import { QRCodeRepository } from '../../domain/repositories/qrcode-repository';

export class QRCodeUseCaseImpl {
  constructor(private qrCodeRepo: QRCodeRepository) { }

  async generate(restaurantId: string, tableNumber: number, label?: string): Promise<QRCode> {
    // 1. Validar si la mesa ya existe para este restaurante
    const existing = await this.qrCodeRepo.getByTableNumber(restaurantId, tableNumber);
    if (existing) {
      throw new Error(`La mesa número ${tableNumber} ya existe para este restaurante.`);
    }

    const hash = uuidv4().split('-')[0];
    const slugPath = `/restaurants/${restaurantId}?table=${hash}`;

    const qrCode: QRCode = {
      id: uuidv4(),
      restaurantId,
      tableNumber,
      label: label || `Mesa ${tableNumber}`,
      slugPath,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.qrCodeRepo.create(qrCode);
    return qrCode;
  }

  async generateBulk(restaurantId: string, targetTotalQuantity: number): Promise<QRCode[]> {
    // 1. Obtener mesas existentes
    const existing = await this.qrCodeRepo.getByRestaurantId(restaurantId);
    const currentCount = existing.length;

    // 2. Si ya tenemos la cantidad deseada o más, no hacemos nada
    if (currentCount >= targetTotalQuantity) {
      return [];
    }

    // 3. Determinar el número de la última mesa existente para seguir la correlación
    const lastTableNumber = existing.reduce((max, qr) => Math.max(max, qr.tableNumber), 0);
    const quantityToCreate = targetTotalQuantity - currentCount;

    const newQrs: QRCode[] = [];
    for (let i = 1; i <= quantityToCreate; i++) {
      const nextNumber = lastTableNumber + i;
      const qr = await this.generate(restaurantId, nextNumber);
      newQrs.push(qr);
    }
    return newQrs;
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