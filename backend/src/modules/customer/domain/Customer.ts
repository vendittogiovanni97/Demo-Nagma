export interface CustomerProps {
  id?: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Customer {
  constructor(private props: CustomerProps) {}

  get id() { return this.props.id; }
  get firstName() { return this.props.firstName; }
  get lastName() { return this.props.lastName; }
  get email() { return this.props.email; }
  get phone() { return this.props.phone; }
  get notes() { return this.props.notes; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get deletedAt() { return this.props.deletedAt; }

  get fullName() {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  toJSON() {
    return { ...this.props };
  }
}
