import { Customer } from '../entities/customer';

export interface CustomerRepository {
  create(customer: Customer): Promise<void>;
  getById(id: string): Promise<Customer | null>;
  getByPhone(phone: string): Promise<Customer | null>;
  update(customer: Customer): Promise<void>;
}