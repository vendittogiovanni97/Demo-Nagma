export type UserRole = 'ADMIN' | 'USER' | 'ARTIST' | 'SUPER_ADMIN';

export interface UserProps {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class User {
  constructor(private props: UserProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get email() { return this.props.email; }
  get password() { return this.props.password; }
  get role() { return this.props.role; }
  get phone() { return this.props.phone; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get deletedAt() { return this.props.deletedAt; }

  toJSON() {
    const { password, ...rest } = this.props;
    return rest;
  }

  toFullJSON() {
    return { ...this.props };
  }
}
