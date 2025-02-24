import { z } from 'zod';

export const CreateUrlSchema = z.object({
  longUrl: z.string().min(1, 'URL cannot be empty').url('Invalid URL format'),
});

export type CreateUrlDto = z.infer<typeof CreateUrlSchema>;
