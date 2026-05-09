import bcrypt from 'bcryptjs';
import { IUserRepository } from '../contracts/IUserRepository';
import { RegisterDTO } from '../contracts/AuthDTOs';
import { User } from '../domain/User';
import { AppError } from '../../../shared/errors/AppError';
import { config } from '../../../config/env';

export class Register {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: RegisterDTO): Promise<User> {
    const exists = await this.userRepository.findByEmail(data.email);
    if (exists) {
      throw new AppError('Utente già registrato con questa email.', 400, 'DUPLICATE_EMAIL');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptSaltRounds);
    
    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      phone: data.phone,
    });

    return this.userRepository.create(user);
  }
}
