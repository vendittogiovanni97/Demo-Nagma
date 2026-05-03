export interface CreateCustomerDTO {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  notes?: string;
}

export interface UpdateCustomerDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface CustomerResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
