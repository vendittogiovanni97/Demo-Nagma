import { Prisma } from '@prisma/client';

type AnyRecord = Record<string, unknown>;

/**
 * Converte campi Decimal in number per la serializzazione JSON.
 * Il frontend si aspetta numeri, ma Prisma ritorna Decimal objects.
 */
export function decimalToNumber<T extends AnyRecord>(obj: T, fields: (keyof T)[]): T {
  const result = { ...obj };
  for (const field of fields) {
    const value = result[field];
    if (
      value &&
      typeof value === 'object' &&
      'toNumber' in value &&
      typeof (value as unknown as Prisma.Decimal).toNumber === 'function'
    ) {
      result[field] = (value as unknown as Prisma.Decimal).toNumber() as T[keyof T];
    }
  }
  return result;
}

export function mapBookingDecimals<T extends AnyRecord>(booking: T): T {
  return decimalToNumber(booking, ['price', 'deposit'] as (keyof T)[]);
}

export function mapTransactionDecimals<T extends AnyRecord>(tx: T): T {
  return decimalToNumber(tx, ['amount'] as (keyof T)[]);
}

export function mapSpesaLiberaDecimals<T extends AnyRecord>(spesa: T): T {
  return decimalToNumber(spesa, ['price'] as (keyof T)[]);
}
