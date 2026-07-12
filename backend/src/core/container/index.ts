type Constructor<T> = new (...args: any[]) => T;

class Container {
  private instances = new Map<string, any>();

  register<T>(token: Constructor<T> | string, instance: T): void {
    const key = typeof token === 'string' ? token : token.name;
    this.instances.set(key, instance);
  }

  get<T>(token: Constructor<T> | string): T {
    const key = typeof token === 'string' ? token : token.name;
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`Container: ${key} non registrato`);
    }
    return instance as T;
  }
}

export const container = new Container();
