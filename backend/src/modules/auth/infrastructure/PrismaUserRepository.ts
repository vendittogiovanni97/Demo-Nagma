import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../contracts/IUserRepository';
import { User } from '../domain/User';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaUserRepository implements IUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): User {
    return new User({
      id: raw.id,
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: raw.role as any,
      phone: raw.phone,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  async findById(id: number): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return raw ? this.mapToDomain(raw) : null;
  }

  async create(user: User): Promise<User> {
    const data = user.toFullJSON();
    const created = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password!,
        role: data.role,
        phone: data.phone,
      },
    });
    return this.mapToDomain(created);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: data as any,
    });
    return this.mapToDomain(updated);
  }
}
