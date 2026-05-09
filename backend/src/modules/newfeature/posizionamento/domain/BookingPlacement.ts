export interface BookingPlacementProps {
  id?: number;
  bookingId: number;
  bodyZone: string;
  view?: string;
  x?: number | null;
  y?: number | null;
  sizeWidth?: number | null;
  sizeHeight?: number | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BookingPlacement {
  constructor(private readonly props: BookingPlacementProps) {}

  get id(): number | undefined { return this.props.id; }
  get bookingId(): number { return this.props.bookingId; }
  get bodyZone(): string { return this.props.bodyZone; }
  get view(): string | undefined { return this.props.view; }
  get x(): number | null | undefined { return this.props.x; }
  get y(): number | null | undefined { return this.props.y; }
  get sizeWidth(): number | null | undefined { return this.props.sizeWidth; }
  get sizeHeight(): number | null | undefined { return this.props.sizeHeight; }
  get notes(): string | null | undefined { return this.props.notes; }
  get createdAt(): Date | undefined { return this.props.createdAt; }
  get updatedAt(): Date | undefined { return this.props.updatedAt; }

  toJSON() {
    return { ...this.props };
  }
}
