import { z } from 'zod';

export const UserSchema = z.object({
  uid: z.uuid(),
  mail: z.email(),
  full_name: z.string().min(2).max(50).regex(/^[a-zA-Z\s_]+$/).trim(),
  u_id: z.string().min(2).max(50).regex(/^[a-zA-Z0-9]+$/).trim(),
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
  bio: z.string().min(5).max(400).trim().optional(),
  pfp: z.url().optional(),
  friends: z.array(z.uuid()).default([]),
  posts: z.array(z.uuid()).default([]),
});

export const EnterUserSchema = z.object({
  mail: z.email(),
  pass: z.string().min(10),
})

export const FriendshipSchema = z.object({
  f_id: z.uuid(),
  user_id: z.uuid(),
  friend_id: z.uuid(),
  status: z.enum(['pending', 'accepted', 'blocked']),
  created_at: z.date().default(() => new Date()),
});

export const OnboardUserSchema = UserSchema.pick({ full_name: true, u_id: true });
export type User = z.infer<typeof UserSchema>;
export type EnterUser = z.infer<typeof EnterUserSchema>;
export type OnboardUser = z.infer<typeof OnboardUserSchema>;
export type Friendship = z.infer<typeof FriendshipSchema>;