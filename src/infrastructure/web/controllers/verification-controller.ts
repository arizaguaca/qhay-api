import { Request, Response } from 'express';
import { VerificationUseCaseImpl } from '../../../application/use-cases/verification-use-case-impl';

export class VerificationController {
  constructor(private verificationUseCase: VerificationUseCaseImpl) {}

  async sendCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body;
      await this.verificationUseCase.sendCode(phone);
      res.json({ message: 'Code sent successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const { phone, code } = req.body;
      const customerId = await this.verificationUseCase.verifyCode(phone, code);
      res.json({ customerId });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}