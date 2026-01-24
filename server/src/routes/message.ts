import { Elysia, t } from "elysia";
import { CLIENT } from "../supabase/config";

// Force immediate persistence for now as per requirements
const persistMessage = async (roomId: string, content: string, senderId: string) => {
    try {
        const { error } = await CLIENT.from('message').insert({
            m_conv_ref_id: roomId,
            m_sender_qid: senderId,
            content: content
        });
        if (error) console.error("Persist error:", error);
    } catch (e) {
        console.error("Persist exception:", e);
    }
}

export const messages = new Elysia({ prefix: '/message' })
    // Initialize or Get Conversation
    .post('/init', async ({ body, headers, set }) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            set.status = 401;
            return { error: "Missing or invalid Authorization header" };
        }

        const { data: userData, error: userError } = await CLIENT.auth.getUser(authHeader.slice(7));
        if (userError || !userData.user) {
            set.status = 401;
            return { error: "Invalid token" };
        }

        const senderQid = userData.user.user_metadata.u_qid;
        const targetQid = body.target_qid;

        if (!targetQid) {
            set.status = 400;
            return { error: "Target QID required" };
        }

        if (senderQid === targetQid) {
            set.status = 400;
            return { error: "Cannot message self" };
        }

        // 1. Check if conversation already exists
        // We need to find a conversation where BOTH users are members
        // This is tricky with Supabase-js simple queries without a stored function, 
        // but we can search for convs the sender is in, then filter on client side (server-side here) or use intersection
        // Optimization: Create a unique constraint on (min(user1, user2), max(user1, user2)) logic if possible, 
        // but for now we follow the schema.

        // Get all conversation IDs the sender is in
        const { data: senderConvs } = await CLIENT
            .from('conversation_member')
            .select('conv_mem_conv_ref_id')
            .eq('conv_mem_qid', senderQid);

        if (senderConvs && senderConvs.length > 0) {
            const senderConvIds = senderConvs.map(c => c.conv_mem_conv_ref_id);

            // Check if target is in any of these conversations
            const { data: existing } = await CLIENT
                .from('conversation_member')
                .select('conv_mem_conv_ref_id')
                .in('conv_mem_conv_ref_id', senderConvIds)
                .eq('conv_mem_qid', targetQid)
                .limit(1);

            if (existing && existing.length > 0) {
                return { conv_id: existing[0].conv_mem_conv_ref_id };
            }
        }

        // 2. Create new conversation
        const { data: newConv, error: createError } = await CLIENT
            .from('conversation')
            .insert({ conv_type: 'dm' })
            .select('conv_id')
            .single();

        if (createError || !newConv) {
            set.status = 500;
            return { error: "Failed to create conversation" };
        }

        // 3. Add members
        const { error: memberError } = await CLIENT
            .from('conversation_member')
            .insert([
                { conv_mem_conv_ref_id: newConv.conv_id, conv_mem_qid: senderQid },
                { conv_mem_conv_ref_id: newConv.conv_id, conv_mem_qid: targetQid }
            ]);

        if (memberError) {
            console.error(memberError);
            set.status = 500;
            return { error: "Failed to add members" };
        }

        return { conv_id: newConv.conv_id };
    }, {
        body: t.Object({
            target_qid: t.String()
        })
    })

    // List Conversations
    .get('/list', async ({ headers, set }) => {
        const authHeader = headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            set.status = 401;
            return { error: "Unauthorized" };
        }
        const { data: userData } = await CLIENT.auth.getUser(authHeader.slice(7));
        if (!userData?.user) {
            set.status = 401;
            return { error: "Invalid User" };
        }
        const myQid = userData.user.user_metadata.u_qid;

        // Get my conversations
        const { data: myMemberships } = await CLIENT
            .from('conversation_member')
            .select('conv_mem_conv_ref_id')
            .eq('conv_mem_qid', myQid);

        if (!myMemberships || myMemberships.length === 0) {
            return { conversations: [] };
        }

        const convIds = myMemberships.map(m => m.conv_mem_conv_ref_id);

        // Fetch details: Need other member's QID and maybe last message
        // This usually requires complex joins or multiple queries with Supabase JS client

        const conversations = [];

        for (const convId of convIds) {
            // Get other member
            // Using explicit foreign key syntax to avoid ambiguity if any
            const { data: members, error: memberError } = await CLIENT
                .from('conversation_member')
                .select('conv_mem_qid, profile:conv_mem_qid(u_name, u_pfp, u_qid)')
                .eq('conv_mem_conv_ref_id', convId)
                .neq('conv_mem_qid', myQid)
                .maybeSingle();

            if (memberError) {
                console.error("Error fetching member for conv", convId, memberError);
                continue;
            }

            // Get last message
            const { data: lastMsg, error: msgError } = await CLIENT
                .from('message')
                .select('content, created_at, m_sender_qid')
                .eq('m_conv_ref_id', convId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (msgError) {
                console.error("Error fetching last msg for conv", convId, msgError);
            }

            if (members && members.profile) {
                conversations.push({
                    conv_id: convId,
                    other_user: members.profile,
                    last_message: lastMsg
                });
            } else {
                // Try fetching profile manually if relation failed but we have QID
                if (members && members.conv_mem_qid) {
                    const { data: p } = await CLIENT.from('profile').select('u_name, u_pfp, u_qid').eq('u_qid', members.conv_mem_qid).single();
                    if (p) {
                        conversations.push({
                            conv_id: convId,
                            other_user: p,
                            last_message: lastMsg
                        });
                    }
                }
            }
        }

        // Sort by last message time
        conversations.sort((a, b) => {
            const dateA = a.last_message ? new Date(a.last_message.created_at).getTime() : 0;
            const dateB = b.last_message ? new Date(b.last_message.created_at).getTime() : 0;
            return dateB - dateA;
        });

        return { conversations };
    })

    // Get Messages
    .get('/:convId', async ({ params: { convId }, headers, set }) => {
        // Simple auth check
        const authHeader = headers.authorization;
        if (!authHeader) { set.status = 401; return { error: "No Auth" }; }

        const { data: messages, error } = await CLIENT
            .from('message')
            .select('*')
            .eq('m_conv_ref_id', convId)
            .order('created_at', { ascending: true }) // Oldest first for chat history usually, or desc for infinite scroll
            .limit(50); // Fetch last 50

        if (error) {
            set.status = 500;
            return { error: error.message };
        }

        return { messages };
    })

    // WebSocket
    .ws('/chat/:roomId', {
        open(ws) {
            const { roomId } = ws.data.params;
            ws.subscribe(roomId);
            console.log(`User joined room ${roomId}`);
        },
        message(ws, message: any) {
            const { roomId } = ws.data.params;
            const { content, sender_qid } = message;

            if (!content || !sender_qid) return;

            // Broadcast to everyone ELSE in room (or everyone including sender if we want confirmation)
            // ws.publish(roomId, message) broadcasts to others. 
            // In optimistic UI, sender already displays it, but maybe we want to confirm timestamp/ID?
            // For now, simple broadcast to others:
            ws.publish(roomId, {
                content,
                sender_qid,
                created_at: new Date().toISOString(),
                // Temp ID/real ID would ideally come from DB insert return
            });

            // Persist
            persistMessage(roomId, content, sender_qid);
        },
        close(ws) {
            const { roomId } = ws.data.params;
            ws.unsubscribe(roomId);
        }
    });