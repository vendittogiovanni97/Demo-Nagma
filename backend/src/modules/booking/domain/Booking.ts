export type BookingStatus = 'CREATO' | 'CONFERMATO' | 'COMPLETATO' | 'MODIFICATO' | 'SPOSTATO' | 'ANNULLATO' | 'CANCELLATO';

export interface BookingProps {
  id?: number;
  customerId: number;
  artistId: number;
  date: Date;
  duration: number;
  status: BookingStatus;
  price?: number | null;
  deposit?: number | null;
  notes?: string | null;
  formData?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  customer?: any;
  artist?: any;
}

export class Booking {
  constructor(private props: BookingProps) {}

  get id() { return this.props.id; }
  get customerId() { return this.props.customerId; }
  get artistId() { return this.props.artistId; }
  get date() { return this.props.date; }
  get duration() { return this.props.duration; }
  get status() { return this.props.status; }
  get price() { return this.props.price; }
  get deposit() { return this.props.deposit; }
  get notes() { return this.props.notes; }
  get formData() { return this.props.formData; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get deletedAt() { return this.props.deletedAt; }
  get customer() { return this.props.customer; }
  get artist() { return this.props.artist; }

  toJSON() {
    return { ...this.props };
  }
}
