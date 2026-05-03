import { Config } from '../domain/Config';

export interface IConfigRepository {
  findByKey(key: string): Promise<Config | null>;
  findAll(): Promise<Config[]>;
  save(config: Config): Promise<Config>;
  count(): Promise<number>;
}
