export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  WAITER = 'waiter',
  MANAGER = 'manager',
  COOK = 'cook',
  CASHIER = 'cashier',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  restaurantId?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}