export interface ConfigProps {
  paramsKey: string;
  value: string;
}

export class Config {
  constructor(private props: ConfigProps) {}

  get paramsKey() { return this.props.paramsKey; }
  get value() { return this.props.value; }

  toJSON() {
    return { ...this.props };
  }
}
