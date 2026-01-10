import { z } from 'zod';

const id = z.uuid();
const qid = z.string().min(2).max(50).regex(/^[a-zA-Z0-9_]+$/).trim();
const name = z.string().min(2).max(50).regex(/^[a-zA-Z\s_]+$/).trim();
const timestamp = z.date().default(() => new Date());

export const UserSchema = z.object({
  u_id: id,
  u_mail: z.email(),
  u_created_at: timestamp,
  u_updated_at: timestamp,
  u_name: name,
  u_qid: qid,
  u_bio: z.string().min(5).max(400).trim().optional(),
  u_pfp: z.url().optional(), 
  u_friends: z.array(id).default([]), 
  u_posts: z.array(id).default([]),   
});


export const SignUserSchema = UserSchema.pick({
  u_qid: true,
  u_name: true,
  u_mail: true,
}).extend({ u_pass: z.string().min(8, "Password must be at least 8 characters"), });

export const LogUserSchema = z.object({
  u_mail: z.email(),
}).extend({ u_pass: z.string().min(8, "Password must be at least 8 characters"), });

export const OnboardUser = UserSchema.pick({
  u_name: true,
  u_qid: true,
});

export type UserSchemaType = z.infer<typeof UserSchema>;
export type LogUserSchemaType = z.infer<typeof LogUserSchema>;
export type SignUserSchemaType = z.infer<typeof SignUserSchema>;
export type OnboardUserType = z.infer<typeof OnboardUser>;