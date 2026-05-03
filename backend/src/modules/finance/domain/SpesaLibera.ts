import { Decimal } from '@prisma/client/runtime/library';

export interface SpesaLiberaProps {
  id?: number;
  name: string;
  price: Decimal | number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SpesaLibera {
  constructor(private props: SpesaLiberaProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get price() { return this.props.price; }
  get createdAt() { return this.props.createdAt; }

  toJSON() {
    return {
      ...this.props,
      price: typeof this.props.price === 'number' ? this.props.price : this.props.price.toNumber(),
    };
  }
}
