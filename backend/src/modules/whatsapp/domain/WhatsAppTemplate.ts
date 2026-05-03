export interface WhatsAppTemplateProps {
  id?: number;
  name: string;
  category?: string | null;
  body: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class WhatsAppTemplate {
  constructor(private props: WhatsAppTemplateProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get category() { return this.props.category; }
  get body() { return this.props.body; }
  get isActive() { return this.props.isActive; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toJSON() {
    return { ...this.props };
  }
}
