import { z } from 'zod';

export const clientSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Client name is required')
      .min(3, 'Client name must be at least 3 characters')
      .max(100, 'Client name must be less than 100 characters'),
    type: z.enum(['person', 'company'], {
      required_error: 'Type is required',
    }),
    valueDop: z
      .string()
      .min(1, 'Value is required')
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: 'Value must be a valid positive number',
      }),
    startDate: z
      .string()
      .min(1, 'Start date is required')
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
      }),
    endDate: z
      .string()
      .min(1, 'End date is required')
      .refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format',
      }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: 'End date must be after or equal to start date',
      path: ['endDate'],
    }
  );

export type ClientFormData = z.infer<typeof clientSchema>;
