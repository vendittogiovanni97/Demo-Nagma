export interface CreateCreamDTO {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateCreamSaleDTO {
  creamId: number;
  artistId: number;
  quantity: number;
}
