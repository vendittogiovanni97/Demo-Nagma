import { Decimal } from '@prisma/client/runtime/library';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface TransactionProps {
  id?: number;
  type: TransactionType;
  category: string;
  description?: string | null;
  amount: Decimal | number;
  date: Date;
  sourceId?: number | null;
  sourceType?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

export class Transaction {
  constructor(private props: TransactionProps) {}

  get id() { return this.props.id; }
  get type() { return this.props.type; }
  get category() { return this.props.category; }
  get description() { return this.props.description; }
  get amount() { return this.props.amount; }
  get date() { return this.props.date; }
  get sourceId() { return this.props.sourceId; }
  get sourceType() { return this.props.sourceType; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get deletedAt() { return this.props.deletedAt; }

  toJSON() {
    return {
      ...this.props,
      amount: typeof this.props.amount === 'number' ? this.props.amount : this.props.amount.toNumber(),
    };
  }
}
