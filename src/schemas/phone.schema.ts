import { z } from 'zod';

export const PhoneIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID must be a positive integer')
    .transform((v) => parseInt(v, 10))
    .pipe(z.number().positive().int()),
});

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .default('1')
    .transform((v) => Math.max(1, parseInt(v, 10) || 1)),
  limit: z
    .string()
    .default('20')
    .transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))),
});

export const SearchQuerySchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  os: z.enum(['Android', 'iOS']).optional(),
  minRam: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  minStorage: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});
