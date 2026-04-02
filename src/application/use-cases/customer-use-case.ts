import { Customer } from '../../domain/entities/customer';

export interface CustomerUseCase {
  create(customer: Customer): Promise<void>;
  getById(id: string): Promise<Customer | null>;
  getByPhone(phone: string): Promise<Customer | null>;
  update(customer: Customer): Promise<void>;
}