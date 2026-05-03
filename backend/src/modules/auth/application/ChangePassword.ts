import bcrypt from 'bcryptjs';
import { IUserRepository } from '../contracts/IUserRepository';
import { ChangePasswordDTO } from '../contracts/AuthDTOs';
import { AppError } from '../../../shared/errors/AppError';
import { configService } from '../../../container';

export class ChangePassword {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: number, data: ChangePasswordDTO): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Utente non trovato', 404);
    }

    if (!(await bcrypt.compare(data.currentPassword, user.password!))) {
      throw new AppError('Password attuale non corretta.', 401);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, configService.getBcryptSaltRoundsSync());
    await this.userRepository.update(userId, { password: hashedPassword });
  }
}
