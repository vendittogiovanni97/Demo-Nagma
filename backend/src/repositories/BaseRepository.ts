import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T, CreateInput, UpdateInput> {
  protected prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  abstract findById(id: string | number): Promise<T | null>;
  abstract findAll(...args: unknown[]): Promise<T[]>;
  abstract create(data: CreateInput): Promise<T>;
  abstract update(id: string | number, data: UpdateInput): Promise<T>;
  abstract delete(id: string | number): Promise<void>;
}
