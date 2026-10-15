import { z } from 'zod';

export const purchaseSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(5).default(1) });
export const bidSchema = z.object({ auctionId: z.string().min(1), amount: z.number().int().positive().max(100000) });
export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().max(254), password: z.string().min(8).max(72) });
