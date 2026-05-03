import { IUserRepository } from '../contracts/IUserRepository';
import { User } from '../domain/User';
import { AppError } from '../../../shared/errors/AppError';

export class GetMe {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Utente non trovato', 401);
    }
    return user;
  }
}
