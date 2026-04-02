import { Request, Response } from 'express';
import { CustomerUseCaseImpl } from '../../../application/use-cases/customer-use-case-impl';

export class CustomerController {
  constructor(private customerUseCase: CustomerUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const customer = req.body;
      await this.customerUseCase.create(customer);
      res.status(201).json({ message: 'Customer created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await this.customerUseCase.getById(id);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.params;
      const customer = await this.customerUseCase.getByPhone(phone);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const customer = req.body;
      await this.customerUseCase.update(customer);
      res.json({ message: 'Customer updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}