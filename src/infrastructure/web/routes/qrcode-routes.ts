import { Router } from 'express';
import { QRCodeController } from '../controllers/qrcode-controller';

export function createQRCodeRoutes(qrCodeController: QRCodeController): Router {
  const router = Router();

  router.post('/', qrCodeController.generate.bind(qrCodeController));
  router.get('/:id', qrCodeController.getById.bind(qrCodeController));
  router.get('/restaurant/:restaurantId', qrCodeController.getByRestaurantId.bind(qrCodeController));
  router.delete('/:id', qrCodeController.delete.bind(qrCodeController));

  return router;
}