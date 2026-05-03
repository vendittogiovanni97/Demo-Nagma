export interface CreateFormTemplateDTO {
  name: string;
  schemaB64: string;
}

export interface UpdateFormTemplateDTO {
  name?: string;
  schemaB64?: string;
}
