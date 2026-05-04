import { Request, Response } from 'express';
import { ServiceRequestUseCaseImpl } from '../../../application/use-cases/service-request-use-case-impl';

export class ServiceRequestController {
  constructor(private useCase: ServiceRequestUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const requestData = req.body;
      if (!requestData.restaurantId || !requestData.tableNumber) {
        res.status(400).json({ error: 'restaurantId and tableNumber are required' });
        return;
      }
      
      await this.useCase.create(requestData);
      res.status(201).json({ message: 'Service request created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (status !== 'pending' && status !== 'resolved') {
        res.status(400).json({ error: 'status must be pending or resolved' });
        return;
      }

      await this.useCase.updateStatus(id, status);
      res.json({ message: 'Status updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByRestaurantId(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const status = req.query.status as 'pending' | 'resolved' | undefined;
      
      const requests = await this.useCase.getByRestaurantId(restaurantId, status);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const status = req.query.status as 'pending' | 'resolved' | undefined;
      
      const requests = await this.useCase.getByCustomerId(customerId, status);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
