import { Elysia, t } from "elysia";
import { CLIENT } from "../supabase/config";

const messageBuffers = new Map<string, any[]>()
const BATCH_SIZE = 5
const FLUSH_INTERVAL = 30000 // 30 seconds

export const messages = new Elysia({ prefix: '/message' })
    .ws('/chat/:roomId', {
        open(ws) {
            const { roomId } = ws.data.params
            // Join room, authenticate user, etc.
        },
        message(ws, message) {
            // Broadcast message to room
        },
        close(ws) {
            // Leave room
        }
    })