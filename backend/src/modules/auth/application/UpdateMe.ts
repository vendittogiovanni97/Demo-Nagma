import { IUserRepository } from '../contracts/IUserRepository';
import { UpdateMeDTO } from '../contracts/AuthDTOs';
import { User } from '../domain/User';

export class UpdateMe {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: number, data: UpdateMeDTO): Promise<User> {
    return this.userRepository.update(userId, data);
  }
}
