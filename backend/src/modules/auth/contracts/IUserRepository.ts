import { User } from '../domain/User';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: number, data: Partial<User>): Promise<User>;
}
