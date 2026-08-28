// Container DI intenzionalmente minimale.
//
// Scelta consapevole (vedi AUDIT_REPORT.md, "Criticità Basse / Miglioramenti"):
// - Nessun concetto di scope/lifecycle (singleton, transient, scoped) né
//   risoluzione automatica delle dipendenze via reflection.
// - Ogni modulo registra esplicitamente le proprie istanze nel bootstrap
//   (core/container/bootstrap.ts) e le recupera con container.get(...).
//
// Questo è sufficiente per la scala attuale (app Express single-process con
// un grafo di dipendenze statico e noto a compile-time) e tiene il codice
// semplice e privo di magia. Se in futuro servissero lifecycle management,
// lazy initialization o test più ergonomici, si potrà valutare un container
// dedicato (es. awilix, tsyringe) senza stravolgere la struttura dei moduli.
type Constructor<T> = new (...args: never[]) => T;

class Container {
  private instances = new Map<string, unknown>();

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
