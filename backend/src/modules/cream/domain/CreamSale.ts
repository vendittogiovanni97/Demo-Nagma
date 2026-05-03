export interface CreamSaleProps {
  id?: number;
  creamId: number;
  artistId: number;
  quantity: number;
  soldAt?: Date;
  
  // Relations (optional for domain)
  artist?: any;
}

export class CreamSale {
  constructor(private props: CreamSaleProps) {}

  get id() { return this.props.id; }
  get creamId() { return this.props.creamId; }
  get artistId() { return this.props.artistId; }
  get quantity() { return this.props.quantity; }
  get soldAt() { return this.props.soldAt; }

  toJSON() {
    return { ...this.props };
  }
}
