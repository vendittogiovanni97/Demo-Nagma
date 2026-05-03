import jwt from 'jsonwebtoken';
import { IUserRepository } from '../contracts/IUserRepository';
import { AuthResponseDTO } from '../contracts/AuthDTOs';
import { AppError } from '../../../shared/errors/AppError';
import { configService } from '../../../container';

export class RefreshToken {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: number): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('Utente non trovato', 401, 'USER_NOT_FOUND');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: configService.getJwtExpirySync() as any }
    );

    return {
      token,
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
