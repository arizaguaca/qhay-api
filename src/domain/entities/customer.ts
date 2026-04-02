export interface Customer {
  id: string;
  name?: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}