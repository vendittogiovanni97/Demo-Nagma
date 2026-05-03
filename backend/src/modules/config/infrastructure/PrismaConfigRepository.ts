import { PrismaClient } from '@prisma/client';
import { IConfigRepository } from '../contracts/IConfigRepository';
import { Config } from '../domain/Config';
import prismaClient from '../../../shared/utils/prisma';

export class PrismaConfigRepository implements IConfigRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  private mapToDomain(raw: any): Config {
    return new Config({
      paramsKey: raw.paramsKey,
      value: raw.value,
    });
  }

  async findByKey(paramsKey: string): Promise<Config | null> {
    const raw = await this.prisma.config.findUnique({ where: { paramsKey } });
    return raw ? this.mapToDomain(raw) : null;
  }

  async findAll(): Promise<Config[]> {
    const raws = await this.prisma.config.findMany();
    return raws.map(this.mapToDomain);
  }

  async save(config: Config): Promise<Config> {
    const data = config.toJSON();
    const created = await this.prisma.config.upsert({
      where: { paramsKey: data.paramsKey },
      update: { value: data.value },
      create: { paramsKey: data.paramsKey, value: data.value },
    });
    return this.mapToDomain(created);
  }

  async count(): Promise<number> {
    return this.prisma.config.count();
  }
}
