import { Role } from '../../domain/entities/user';

// Define the roles including staff and customers
export type AuthRole = Role | 'customer';

export interface TokenPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: AuthRole;
  restaurantId?: string;
}

export interface TokenService {
  /**
   * Generates a token signed with the provided payload.
   */
  generateToken(payload: TokenPayload): string;

  /**
   * Verifies the given token and returns the parsed payload or null if invalid.
   */
  verifyToken(token: string): TokenPayload | null;
}
