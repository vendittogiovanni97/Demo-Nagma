export interface ShiftProps {
  id?: string;
  staffId: number;
  date: Date;
  startTime: string;
  endTime: string;
  breakDuration?: number | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Shift {
  constructor(private props: ShiftProps) {}

  get id() { return this.props.id; }
  get staffId() { return this.props.staffId; }
  get date() { return this.props.date; }
  get startTime() { return this.props.startTime; }
  get endTime() { return this.props.endTime; }
  get breakDuration() { return this.props.breakDuration; }
  get notes() { return this.props.notes; }

  toJSON() {
    return { ...this.props };
  }
}
