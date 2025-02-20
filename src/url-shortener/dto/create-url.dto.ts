import { z } from 'zod';

export const CreateUrlSchema = z.object({
  longUrl: z.string().url('Invalid URL format'),
});

export type CreateUrlDto = z.infer<typeof CreateUrlSchema>;
