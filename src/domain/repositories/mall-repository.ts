import { Mall } from '../entities/mall';

export interface MallRepository {
  fetch(): Promise<Mall[]>;
  getById(id: string): Promise<Mall | null>;
}
