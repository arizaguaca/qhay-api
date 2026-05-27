import jwt from 'jsonwebtoken';
import { TokenPayload, TokenService } from '../../application/services/token-service';

export class JwtTokenService implements TokenService {
  constructor(
    private secret: string,
    private expiration: string
  ) {}

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiration as any });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret) as any;
      
      // Ensure we map the decoded fields to TokenPayload
      if (decoded && typeof decoded === 'object' && decoded.userId && decoded.role) {
        return {
          userId: decoded.userId,
          email: decoded.email,
          phone: decoded.phone,
          role: decoded.role,
          restaurantId: decoded.restaurantId
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
