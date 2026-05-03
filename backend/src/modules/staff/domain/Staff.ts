export type StaffType = 'ARTIST' | 'ADMIN' | 'RECEPTION';

export interface StaffProps {
  id?: number;
  name: string;
  type: StaffType;
  color?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Staff {
  constructor(private props: StaffProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get type() { return this.props.type; }
  get color() { return this.props.color; }

  toJSON() {
    return { ...this.props };
  }
}
