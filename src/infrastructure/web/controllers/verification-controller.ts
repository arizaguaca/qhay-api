import { Request, Response } from 'express';
import { VerificationUseCaseImpl } from '../../../application/use-cases/verification-use-case-impl';
import { EntityType } from '../../../domain/entities/verification-code';

export class VerificationController {
  constructor(private verificationUseCase: VerificationUseCaseImpl) {}

  async sendCode(req: Request, res: Response): Promise<void> {
    try {
      const { contact, channel, entityType } = req.body;
      if (!contact || !channel || !entityType) {
        res.status(400).json({ error: 'Contact, channel and entityType are required' });
        return;
      }

      await this.verificationUseCase.sendCode(contact, channel, entityType as EntityType);
      res.json({ message: 'Code sent successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const { contact, code } = req.body;
      if (!contact || !code) {
        res.status(400).json({ error: 'Contact and code are required' });
        return;
      }

      const entityId = await this.verificationUseCase.verifyCode(contact, code);
      res.json({ entityId });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}