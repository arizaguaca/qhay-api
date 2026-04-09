export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  STAFF = 'staff'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  restaurantId?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}