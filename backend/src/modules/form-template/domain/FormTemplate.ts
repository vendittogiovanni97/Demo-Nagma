export interface FormTemplateProps {
  id?: number;
  name: string;
  schemaB64: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FormTemplate {
  constructor(private props: FormTemplateProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get schemaB64() { return this.props.schemaB64; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toJSON() {
    return { ...this.props };
  }
}
