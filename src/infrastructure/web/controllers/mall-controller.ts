import { Request, Response } from 'express';
import { MallUseCase } from '../../../application/use-cases/mall-use-case';

export class MallController {
  constructor(private mallUseCase: MallUseCase) {}

  async fetch(req: Request, res: Response): Promise<void> {
    try {
      const malls = await this.mallUseCase.fetch();
      res.json(malls);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
