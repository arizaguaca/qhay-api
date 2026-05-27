import { Request, Response, NextFunction } from 'express';
import { TokenService, AuthRole, TokenPayload } from '../../../application/services/token-service';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export class AuthMiddleware {
  constructor(private tokenService: TokenService) {}

  /**
   * Middleware to authenticate the request by verifying the JWT cookie (or Bearer token).
   */
  authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Read from cookies (provided by cookie-parser)
    let token = req.cookies?.token;

    // Fallback: Read from Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Authentication token required' });
      return;
    }

    const payload = this.tokenService.verifyToken(token);
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired authentication token' });
      return;
    }

    req.user = payload;
    next();
  };

  /**
   * Middleware to authorize the request based on the user's role.
   */
  authorize = (allowedRoles: AuthRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: 'Access denied: insufficient permissions' });
        return;
      }

      next();
    };
  };
}
