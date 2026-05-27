import { Request, Response } from 'express';
import { VerificationUseCaseImpl } from '../../../application/use-cases/verification-use-case-impl';
import { EntityType } from '../../../domain/entities/verification-code';
import { TokenService } from '../../../application/services/token-service';
import { UserUseCaseImpl } from '../../../application/use-cases/user-use-case-impl';
import { CustomerUseCaseImpl } from '../../../application/use-cases/customer-use-case-impl';
import { setTokenCookie } from '../cookie-helper';

export class VerificationController {
  constructor(
    private verificationUseCase: VerificationUseCaseImpl,
    private tokenService: TokenService,
    private userUseCase: UserUseCaseImpl,
    private customerUseCase: CustomerUseCaseImpl
  ) {}

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

      const { entityId, entityType } = await this.verificationUseCase.verifyCode(contact, code);

      let role: any = 'customer';
      let email: string | undefined;
      let phone: string | undefined;

      if (entityType === EntityType.USER) {
        const user = await this.userUseCase.getById(entityId);
        if (!user) {
          res.status(404).json({ error: 'User associated with verification code not found' });
          return;
        }
        role = user.role;
        email = user.email;
        phone = user.phone;
      } else if (entityType === EntityType.CUSTOMER) {
        const customer = await this.customerUseCase.getById(entityId);
        if (!customer) {
          res.status(404).json({ error: 'Customer associated with verification code not found' });
          return;
        }
        role = 'customer';
        phone = customer.phone;
      }

      // Generate JWT
      const token = this.tokenService.generateToken({
        userId: entityId,
        email,
        phone,
        role,
      });

      // Set HttpOnly cookie
      setTokenCookie(res, token);

      res.json({ entityId, entityType, role });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}