export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  ARTIST = 'ARTIST',
}

export enum BookingStatus {
  CONFIRMED = 'CONFERMATO',
  CANCELLED = 'ANNULLATO',
  RESCHEDULED = 'SPOSTATO',
  COMPLETED = 'COMPLETATO',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}
