export interface TransactionHistoryProps {
  id?: number;
  transactionId: number;
  action: string;
  oldData?: any;
  newData?: any;
  changedById?: number;
  changedAt?: Date;
  changedBy?: { name: string };
  transaction?: { description: string; type: string };
}

export class TransactionHistory {
  id?: number;
  transactionId: number;
  action: string;
  oldData?: any;
  newData?: any;
  changedById?: number;
  changedAt?: Date;
  changedBy?: { name: string };
  transaction?: { description: string; type: string };

  constructor(props: TransactionHistoryProps) {
    this.id = props.id;
    this.transactionId = props.transactionId;
    this.action = props.action;
    this.oldData = props.oldData;
    this.newData = props.newData;
    this.changedById = props.changedById;
    this.changedAt = props.changedAt;
    this.changedBy = props.changedBy;
    this.transaction = props.transaction;
  }


  toJSON() {
    return {
      id: this.id,
      transactionId: this.transactionId,
      action: this.action,
      oldData: this.oldData,
      newData: this.newData,
      changedById: this.changedById,
      changedAt: this.changedAt,
      changedBy: this.changedBy,
      transaction: this.transaction,
    };
  }
}


