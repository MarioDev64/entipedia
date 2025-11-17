import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['new', 'in_progress', 'in_review', 'completed'], {
    required_error: 'Status is required',
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required',
  }),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
