export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  ARTIST = 'ARTIST',
}

export type BookingStatus = 'CREATO' | 'CONFERMATO' | 'COMPLETATO' | 'MODIFICATO' | 'SPOSTATO' | 'ANNULLATO' | 'CANCELLATO';

export enum TransactionType {
  ENTRATA = 'ENTRATA',
  USCITA = 'USCITA',
}

export type StaffType = 'COLLABORATORE' | 'APPRENDISTA';
