export interface CreamProps {
  id?: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Cream {
  constructor(private props: CreamProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get description() { return this.props.description; }
  get isActive() { return this.props.isActive; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toJSON() {
    return { ...this.props };
  }
}
