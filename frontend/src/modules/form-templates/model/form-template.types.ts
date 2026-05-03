export interface FormTemplate {
  id: number;
  name: string;
  schemaB64: string;
  createdAt: string;
}

export interface CreateFormTemplateData {
  name: string;
  schemaB64: string;
}

export interface FieldDef {
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  name: string;
  label: string;
  required?: boolean;
  options?: string[];
}
