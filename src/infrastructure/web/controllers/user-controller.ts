import { Request, Response } from 'express';
import { UserUseCaseImpl } from '../../../application/use-cases/user-use-case-impl';

export class UserController {
  constructor(private userUseCase: UserUseCaseImpl) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;
      await this.userUseCase.create(user);
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const user = await this.userUseCase.login(email, password);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await this.userUseCase.getById(id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      const user = await this.userUseCase.getByEmail(email);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getByPhone(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.params;
      const user = await this.userUseCase.getByPhone(phone);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getStaffByRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const users = await this.userUseCase.getStaffByRestaurant(restaurantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async fetch(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userUseCase.fetch();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = req.body;
      await this.userUseCase.update(user);
      res.json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.userUseCase.delete(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}