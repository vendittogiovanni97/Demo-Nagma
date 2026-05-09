import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../auth/contracts/IUserRepository';
import { AppError } from '../../../shared/errors/AppError';
import { config } from '../../../config/env';

export class ResetStaffPassword {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: number, data: { newPassword: string }): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('Utente non trovato.', 404);

    const hashedPassword = await bcrypt.hash(data.newPassword, config.bcryptSaltRounds);
    await this.userRepository.update(userId, { password: hashedPassword });
  }
}
