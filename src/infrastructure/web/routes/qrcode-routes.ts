import { Router } from 'express';
import { QRCodeController } from '../controllers/qrcode-controller';
import { AuthMiddleware } from '../middlewares/auth-middleware';
import { Role } from '../../../domain/entities/user';

export function createQRCodeRoutes(qrCodeController: QRCodeController, authMiddleware: AuthMiddleware): Router {
  const router = Router();

  const writeRoles = [Role.OWNER, Role.ADMIN, Role.MANAGER];

  // Write actions (Owner/Admin/Manager)
  router.post('/', authMiddleware.authenticate, authMiddleware.authorize(writeRoles), qrCodeController.generate.bind(qrCodeController));
  router.delete('/:id', authMiddleware.authenticate, authMiddleware.authorize(writeRoles), qrCodeController.delete.bind(qrCodeController));

  // Query all QR codes for restaurant (restricted to staff)
  router.get('/restaurant/:restaurantId', authMiddleware.authenticate, authMiddleware.authorize(writeRoles), qrCodeController.getByRestaurantId.bind(qrCodeController));

  // Read single QR code (authenticated: customer & staff)
  router.get('/:id', authMiddleware.authenticate, qrCodeController.getById.bind(qrCodeController));

  return router;
}