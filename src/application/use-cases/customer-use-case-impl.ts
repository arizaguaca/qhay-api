import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../domain/entities/customer';
import { CustomerRepository } from '../../domain/repositories/customer-repository';

export class CustomerUseCaseImpl {
  constructor(private customerRepo: CustomerRepository) {}

  async create(customer: Customer): Promise<void> {
    if (!customer.id) {
      customer.id = uuidv4();
    }
    customer.isActive = false;
    customer.createdAt = new Date();
    customer.updatedAt = new Date();

    await this.customerRepo.create(customer);
  }

  async getById(id: string): Promise<Customer | null> {
    return await this.customerRepo.getById(id);
  }

  async getByPhone(phone: string): Promise<Customer | null> {
    return await this.customerRepo.getByPhone(phone);
  }

  async update(customer: Customer): Promise<void> {
    customer.updatedAt = new Date();
    await this.customerRepo.update(customer);
  }
}