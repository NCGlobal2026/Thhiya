import { z } from 'zod';

export const getInsightSchema = z.object({
  service: z.string().min(1, 'Service is required'),
  country: z.string().min(1, 'Country is required')
});

export type GetInsightInput = z.infer<typeof getInsightSchema>;
