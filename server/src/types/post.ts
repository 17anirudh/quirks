import { z } from 'zod';

export const postSchema = z.object({
  p_id: z.uuid(),
  u_id: z.uuid(),
  type: z.enum(['image', 'video', 'moment', 'code']),
  code_lang: z.enum([
    'js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'rb', 'go', 'rs',
    'php', 'swift', 'kt', 'html', 'css', 'json', 'xml', 'yaml', 'md', 'sh', 'sql'
  ]).optional(),
  p_url: z.url(),
  posted_at: z.date().default(() => new Date()),
  description: z.string().min(2).max(500).trim(),
  tags: z.array(z.string()).max(20).default([]),
  like_count: z.number().int().nonnegative().default(0),
  comment_count: z.number().int().nonnegative().default(0),
});

export const commentSchema = z.object({
  c_id: z.uuid(),
  p_id: z.uuid(),
  u_id: z.uuid(),
  content: z.string().min(1).max(500).trim(),
  created_at: z.date().default(() => new Date()),
  like_count: z.number().int().nonnegative().default(0),
  reply_count: z.number().int().nonnegative().default(0),
});

export const likeSchema = z.object({
  l_id: z.uuid(),
  u_id: z.uuid(),
  target_type: z.enum(['post', 'comment']),
  target_id: z.uuid(),
  created_at: z.date().default(() => new Date()),
});

export type Post = z.infer<typeof PostSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type Like = z.infer<typeof LikeSchema>;