export type StaffType = 'COLLABORATORE' | 'APPRENDISTA';

export interface StaffProps {
  id?: number;
  name: string;
  type: StaffType;
  color?: string | null;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Staff {
  constructor(private props: StaffProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get type() { return this.props.type; }
  get color() { return this.props.color; }
  get deletedAt() { return this.props.deletedAt; }

  toJSON() {
    return { ...this.props };
  }
}
