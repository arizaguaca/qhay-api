import { Request, Response } from 'express';
import { QRCodeUseCaseImpl } from '../../../application/use-cases/qrcode-use-case-impl';

export class QRCodeController {
  constructor(private qrCodeUseCase: QRCodeUseCaseImpl) {}

  async generate(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, tableNumber, quantity, label } = req.body;

      if (quantity) {
        const qrCodes = await this.qrCodeUseCase.generateBulk(restaurantId, parseInt(quantity));
        res.status(201).json(qrCodes);
        return;
      }

      const qrCode = await this.qrCodeUseCase.generate(restaurantId, parseInt(tableNumber), label);
      res.status(201).json(qrCode);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const qrCode = await this.qrCodeUseCase.getById(id);
      if (!qrCode) {
        res.status(404).json({ error: 'QR Code not found' });
        return;
      }
      res.json(qrCode);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByRestaurantId(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const qrCodes = await this.qrCodeUseCase.getByRestaurantId(restaurantId);
      res.json(qrCodes);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.qrCodeUseCase.delete(id);
      res.json({ message: 'QR Code deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}