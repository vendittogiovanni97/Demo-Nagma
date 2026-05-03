export interface AttachmentProps {
  id: string;
  bookingId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Attachment {
  constructor(private props: AttachmentProps) {}

  get id() { return this.props.id; }
  get bookingId() { return this.props.bookingId; }
  get fileName() { return this.props.fileName; }
  get fileSize() { return this.props.fileSize; }
  get mimeType() { return this.props.mimeType; }
  get filePath() { return this.props.filePath; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  toJSON() {
    return { ...this.props };
  }
}
