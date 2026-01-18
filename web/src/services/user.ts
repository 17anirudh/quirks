import { z } from 'zod';

export const profileSchema = z.object({
  u_id: z.uuid(),
  u_qid: z
        .string()
        .min(4, "your qid must be atleat 4 characters")
        .max(200, "your qid must be below 200 characters"),
  u_mail: z.email("Enter valid email"),
  u_name: z
        .string()
        .min(3, "A name cannot be less than 3 letters")
        .max(150, "A name cannot be more than 150 letters"),
  u_bio: z
        .string()
        .min(5, "5 words is the least")
        .max(260, "260 words is the limit")
        .optional(),
  u_pfp: z.url().optional(),
  u_created_at: z.date().default(() => new Date()),
  u_updates_at: z.date().default(() => new Date())
});