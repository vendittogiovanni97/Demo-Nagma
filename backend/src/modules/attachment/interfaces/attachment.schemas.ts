import { z } from 'zod';

/**
 * Validazione upload di attachment
 */
export const AttachmentUploadSchema = z.object({
  bookingId: z.string().cuid('ID booking deve essere un CUID valido'),
});

/**
 * Schema per risposta attachment
 */
export const AttachmentResponseSchema = z.object({
  id: z.string(),
  bookingId: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Schema per dettagli attachment completi
 */
export const AttachmentDetailSchema = z.object({
  id: z.string(),
  bookingId: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  preview: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AttachmentUploadInput = z.infer<typeof AttachmentUploadSchema>;
export type AttachmentResponse = z.infer<typeof AttachmentResponseSchema>;
export type AttachmentDetail = z.infer<typeof AttachmentDetailSchema>;
