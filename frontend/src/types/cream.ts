export interface Cream {
  id: string;
  name: string;
  brand?: string;
  price: number;
  stock: number;
}

export interface CreateCreamData {
  name: string;
  brand?: string;
  price: number;
  stock: number;
}

export interface CreamSale {
  id: string;
  creamId: string;
  sellerId: string;
  customerId?: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  cream?: Pick<Cream, 'id' | 'name'>;
  seller?: { id: string; name: string };
  customer?: { id: string; firstName: string; lastName: string };
}

export interface CreateCreamSaleData {
  creamId: string;
  sellerId: string;
  customerId?: string;
  quantity: number;
  totalPrice: number;
}
