import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const fileUploadSchema = z.object({
  name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  fileType: z
    .string()
    .min(1, 'File type is required')
    .refine((type) => ACCEPTED_FILE_TYPES.includes(type), {
      message:
        'Invalid file type. Accepted: PDF, Word, Excel, Images (JPG, PNG, WEBP)',
    }),
  fileSize: z.number().max(MAX_FILE_SIZE, 'File size must be less than 10MB'),
});

export type FileUploadData = z.infer<typeof fileUploadSchema>;

export { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES };
