import { Request, Response } from 'express';
import { UserUseCaseImpl } from '../../../application/use-cases/user-use-case-impl';
import { UserRegistrationUseCase } from '../../../application/use-cases/registration/user-registration-use-case';
import { Role } from '../../../domain/entities/user';
import { Channel } from '../../../domain/entities/verification-code';

export class UserController {
  constructor(
    private userUseCase: UserUseCaseImpl,
    private userRegistrationUseCase: UserRegistrationUseCase
  ) { }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { channel = Channel.EMAIL, ...userData } = req.body;
      const user = { ...userData, role: userData.role || Role.OWNER };

      await this.userRegistrationUseCase.execute(user, channel as Channel);
      res.status(201).json({ message: 'User created successfully. Verification code sent.' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async createStaff(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const allowedRoles = [Role.MANAGER, Role.CASHIER, Role.COOK, Role.WAITER];
      
      if (!allowedRoles.includes(userData.role)) {
        res.status(400).json({ 
          error: `Invalid staff role. Allowed roles are: ${allowedRoles.join(', ')}` 
        });
        return;
      }

      if (!userData.restaurantId) {
        res.status(400).json({ error: 'restaurantId is required for staff registration' });
        return;
      }

      // Mapear 'name' a 'fullName' por si acaso
      if (userData.name && !userData.fullName) {
        userData.fullName = userData.name;
      }

      await this.userRegistrationUseCase.execute(userData, Channel.EMAIL);
      res.status(201).json({ message: 'Staff member created successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateStaff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userData = req.body;
      const allowedRoles = [Role.MANAGER, Role.CASHIER, Role.COOK, Role.WAITER];

      // Verificar que el usuario a editar existe y es staff
      const existingUser = await this.userUseCase.getById(id);
      if (!existingUser) {
        res.status(404).json({ error: 'Staff member not found' });
        return;
      }

      if (!allowedRoles.includes(existingUser.role)) {
        res.status(403).json({ error: 'Cannot update non-staff users via this endpoint' });
        return;
      }

      // Si intentan cambiar el rol, validar que sea a otro rol de staff
      if (userData.role && !allowedRoles.includes(userData.role)) {
        res.status(400).json({ error: 'Invalid staff role' });
        return;
      }

      const updatedUser = { ...userData, id };
      await this.userUseCase.update(updatedUser);
      res.json({ message: 'Staff member updated successfully' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async deleteStaff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Verificar que el usuario a eliminar existe y es staff
      const existingUser = await this.userUseCase.getById(id);
      if (!existingUser) {
        res.status(404).json({ error: 'Staff member not found' });
        return;
      }

      const allowedRoles = [Role.MANAGER, Role.CASHIER, Role.COOK, Role.WAITER];
      if (!allowedRoles.includes(existingUser.role)) {
        res.status(403).json({ error: 'Cannot delete non-staff users via this endpoint' });
        return;
      }

      await this.userUseCase.delete(id);
      res.json({ message: 'Staff member deleted successfully' });
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