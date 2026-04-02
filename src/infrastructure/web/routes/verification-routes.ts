import { Router } from 'express';
import { VerificationController } from '../controllers/verification-controller';

export function createVerificationRoutes(verificationController: VerificationController): Router {
  const router = Router();

  router.post('/send-code', verificationController.sendCode.bind(verificationController));
  router.post('/verify-code', verificationController.verifyCode.bind(verificationController));

  return router;
}