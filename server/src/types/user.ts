import { z } from 'zod';

export const profileSchema = z.object({
  u_id: z.uuid(),
  u_qid: z.string().min(3).max(50),
  u_name: z.string().min(3).max(50),
  u_mail: z.email(),
  u_bio: z.string().optional(),
  u_pfp: z.url().optional(),
  u_created_at: z.date().default(() => new Date()),
  u_updates_at: z.date().default(() => new Date())
});

export const modifyUser = z.object({
  u_qid: z.string().min(3).max(50).optional(),
  u_name: z.string().min(3).max(50).optional(),
  u_bio: z.string().optional(),
  u_pfp: z.url().optional(),
})

export const signInUser = profileSchema.pick({
  u_qid: true,
  u_name: true,
  u_created_at: true,
})

export const deleteUser = profileSchema.pick({
  u_id: true
})