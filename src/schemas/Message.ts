import { z } from 'zod';

export const MessageSchema = z.object({
  m_id: z.uuid(),
  chat_id: z.uuid(),
  sender_id: z.uuid(),
  reply_to: z.uuid().optional().nullable(),
  content: z.string().min(1).max(2000).trim(),
  type: z.enum(['text', 'image', 'video', 'file', 'voice']).default('text'),
  media_url: z.url().optional().nullable(),
  sent_at: z.date().default(() => new Date()),
  is_deleted: z.boolean().default(false),
  delivered_to: z.array(z.uuid()).default([]),
  read_by: z.array(z.uuid()).default([]),
});

export const DirectSchema = z.object({
  d_id: z.uuid(),
  one_id: z.uuid(),
  two_id: z.uuid(),
  last_message_at: z.date().optional().nullable(),
  is_read: z.boolean().default(true),
  auto_delete: z.union([z.literal(9), z.literal(27), z.literal(36), z.literal(45)]).default(36),
});

export const ChatMemberSchema = z.object({
  chat_id: z.uuid(),
  u_id: z.uuid(),
  role: z.enum(['admin', 'member']).default('member'),
  joined_at: z.date().default(() => new Date()),
  is_muted: z.boolean().default(false),
});

// Websocket Events
export const WSMessageEventSchema = z.object({
  event: z.enum(['message', 'typing', 'read', 'delivered', 'user_online', 'user_offline']),
  chat_id: z.uuid(),
  data: z.any()
});

export const WSTypingEventSchema = z.object({
  chat_id: z.uuid(),
  u_id: z.uuid(),
  is_typing: z.boolean(),
});

export type Message = z.infer<typeof MessageSchema>;
export type Direct = z.infer<typeof DirectSchema>;