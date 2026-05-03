import { ICreamRepository } from '../contracts/ICreamRepository';
import { CreateCreamDTO } from '../contracts/CreamDTOs';
import { Cream } from '../domain/Cream';

export class CreateCream {
  constructor(private creamRepository: ICreamRepository) {}

  async execute(data: CreateCreamDTO): Promise<Cream> {
    const cream = new Cream({
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
    });
    return this.creamRepository.create(cream);
  }
}
