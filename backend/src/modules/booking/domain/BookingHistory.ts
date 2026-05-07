export interface BookingHistoryProps {
  id?: number;
  bookingId: number;
  action: string;
  oldDate?: Date | null;
  newDate?: Date | null;
  changedById?: number | null;
  changedAt?: Date;
  booking?: any;
  changedBy?: any;
}

export class BookingHistory {
  constructor(private props: BookingHistoryProps) {}

  get id() { return this.props.id; }
  get bookingId() { return this.props.bookingId; }
  get action() { return this.props.action; }
  get oldDate() { return this.props.oldDate; }
  get newDate() { return this.props.newDate; }
  get changedById() { return this.props.changedById; }
  get changedAt() { return this.props.changedAt; }
  get booking() { return this.props.booking; }
  get changedBy() { return this.props.changedBy; }

  toJSON() {
    return { ...this.props };
  }
}
