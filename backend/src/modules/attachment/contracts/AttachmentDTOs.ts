export interface UploadAttachmentDTO {
  bookingId: number;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
}

export interface AttachmentResponseDTO {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
  preview?: string | null;
}
