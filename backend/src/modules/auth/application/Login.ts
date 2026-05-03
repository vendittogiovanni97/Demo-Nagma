import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../contracts/IUserRepository';
import { LoginDTO, AuthResponseDTO } from '../contracts/AuthDTOs';
import { AppError } from '../../../shared/errors/AppError';
import { configService } from '../../../container';

export class Login {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password!))) {
      throw new AppError('Credenziali non valide.', 401, 'INVALID_CREDENTIALS');
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
