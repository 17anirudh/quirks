import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SUPABASE_CLIENT } from '@/hooks/utils'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar'
import { useAuth } from '@/hooks/auth-provider'
import type { Message, UserProfile } from '@/types'
import Loader from '@/components/loader'
import { ChatMessage } from '@/lib/components/message-bubble'

export const Route = createFileRoute('/_protected/chats/$chatId')({
    component: ChatRoom,
})

function ChatRoom() {
    const { chatId } = useParams({ from: '/_protected/chats/$chatId' })
    const { qid } = useAuth()
    const [input, setInput] = useState('')
    const [localMessages, setLocalMessages] = useState<Message[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)
    const wsRef = useRef<WebSocket | null>(null)

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    const { data: partner, isLoading: isPartnerLoading } = useQuery({
        queryKey: ['conversation_partner', chatId],
        queryFn: async () => {
            const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
            if (!session) throw new Error("Unauthorized");

            const { data, error } = await SUPABASE_CLIENT
                .from('conversation_member')
                .select('conv_mem_qid, profile:conv_mem_qid(u_name, u_pfp, u_qid)')
                .eq('conv_mem_conv_ref_id', chatId)
                .neq('conv_mem_qid', qid)
                .single()

            if (error) throw error;
            const p = data?.profile;
            if (Array.isArray(p)) return p[0] as UserProfile;
            return p as UserProfile;
        },
        enabled: !!qid
    })

    const { data: history, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['messages', chatId],
        queryFn: async () => {
            const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
            if (!session) throw new Error("Unauthorized");

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/message/${chatId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            return data.messages as Message[];
        }
    });

    useEffect(() => {
        scrollToBottom()
    }, [history, localMessages])

    // CRITICAL: Clear local messages when switching chats
    useEffect(() => {
        console.log(`[FRONTEND STATE] Chat changed to ${chatId}, clearing local messages`);
        setLocalMessages([]);
    }, [chatId])

    // WebSocket Connection
    useEffect(() => {
        if (!chatId) {
            console.log('[FRONTEND WS] No chatId, skipping connection');
            return;
        }

        // CRITICAL: Clear the ref immediately to prevent race condition
        // where sendMessage might use the old WebSocket during transition
        console.log('[FRONTEND WS] Clearing old WebSocket ref before creating new connection');
        wsRef.current = null;

        const wsUrl = import.meta.env.VITE_BACKEND_URL.replace('http', 'ws') + `/message/chat/${chatId}`
        console.log(`[FRONTEND WS] Connecting to: ${wsUrl}`);
        console.log(`[FRONTEND WS] Chat ID: ${chatId}`);
        console.log(`[FRONTEND WS] User QID: ${qid}`);

        const ws = new WebSocket(wsUrl)

        ws.onopen = () => {
            console.log(`[FRONTEND WS] Connected to chat ${chatId}, setting wsRef`);
            // Only set the ref once connection is established
            wsRef.current = ws;
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                console.log(`[FRONTEND WS] Received message in chat ${chatId}:`, msg);

                // CRITICAL: Verify the message is for this chat
                if (msg.room_id && msg.room_id !== chatId) {
                    console.error(`[FRONTEND WS] MESSAGE LEAK DETECTED! Message for room ${msg.room_id} received in chat ${chatId}`);
                    return;
                }

                if (msg.sender_qid !== qid) {
                    console.log(`[FRONTEND WS] Adding message from ${msg.sender_qid} to local state`);
                    setLocalMessages(prev => [...prev, msg])
                } else {
                    console.log(`[FRONTEND WS] Ignoring own message (optimistic UI already displayed)`);
                }
            } catch (e) {
                console.error(`[FRONTEND WS] Parse error in chat ${chatId}:`, e)
            }
        }

        ws.onerror = (error) => {
            console.error(`[FRONTEND WS] Error in chat ${chatId}:`, error);
        }

        ws.onclose = () => {
            console.log(`[FRONTEND WS] Connection closed for chat ${chatId}`);
        }

        return () => {
            console.log(`[FRONTEND WS] CLEANUP: Closing connection for chat ${chatId}`);
            if (wsRef.current === ws) {
                console.log(`[FRONTEND WS] Clearing wsRef as it matches current connection`);
                wsRef.current = null;
            }
            ws.close()
        }
    }, [chatId, qid])

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current || !qid) {
            console.log('[FRONTEND SEND] Cannot send: missing input, ws, or qid');
            return;
        }

        const content = input.trim()

        console.log(`[FRONTEND SEND] Sending message to chat ${chatId} from ${qid}`);
        console.log(`[FRONTEND SEND] Content: "${content}"`);

        // Optimistic Update
        const tempMsg: Message = {
            content,
            m_sender_qid: qid,
            created_at: new Date().toISOString()
        }

        setLocalMessages(prev => [...prev, tempMsg])
        setInput('')

        // Send via WebSocket
        const payload = {
            content,
            sender_qid: qid
        };

        console.log(`[FRONTEND SEND] WebSocket payload:`, payload);
        wsRef.current.send(JSON.stringify(payload))
        console.log(`[FRONTEND SEND] Message sent successfully`);

        scrollToBottom()
    }

    if (isPartnerLoading || isHistoryLoading) return <Loader />

    const allMessages = [...(history || []), ...localMessages]

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden md:flex w-1/3 lg:w-1/4 border-r flex-col">
                <div className="border-b p-4 font-bold text-xl flex justify-between items-center">
                    Messages
                    <Link to="/chats" className="text-xs text-muted-foreground uppercase">Index</Link>
                </div>
                <ConversationListSideBar currentChatId={chatId} />
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col w-full">
                <div className="flex items-center gap-3 border-b p-2">
                    <Link to="/chats" className="md:hidden p-2">
                        <ArrowLeft />
                    </Link>
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={partner?.u_pfp || undefined} />
                        <AvatarFallback>{partner?.u_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold">{partner?.u_name || partner?.u_qid || 'User'}</div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
                >
                    {(() => {
                        // Group consecutive messages from the same sender
                        const groupedMessages: Array<{
                            sender: string;
                            messages: string[];
                            timestamps: string[];
                        }> = [];

                        allMessages.forEach((msg) => {
                            const lastGroup = groupedMessages[groupedMessages.length - 1];
                            if (lastGroup && lastGroup.sender === msg.m_sender_qid) {
                                lastGroup.messages.push(msg.content);
                                lastGroup.timestamps.push(msg.created_at);
                            } else {
                                groupedMessages.push({
                                    sender: msg.m_sender_qid,
                                    messages: [msg.content],
                                    timestamps: [msg.created_at],
                                });
                            }
                        });

                        return groupedMessages.map((group, groupIndex) => {
                            const isMe = group.sender === qid;
                            const lastTimestamp = group.timestamps[group.timestamps.length - 1];

                            return (
                                <ChatMessage
                                    key={groupIndex}
                                    messages={group.messages}
                                    variant={isMe ? "sent" : "received"}
                                    timestamp={new Date(lastTimestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    showTimestamp={true}
                                />
                            );
                        });
                    })()}
                </div>

                <div className="border-t p-4 flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button onClick={sendMessage} size="icon" disabled={!input.trim()}>
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ConversationListSideBar({ currentChatId }: { currentChatId?: string }) {
    const { data: conversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
            if (!session) return [];
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/message/list`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            return data.conversations as any[];
        }
    });

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations?.map((conv) => (
                <Link
                    key={conv.conv_id}
                    to={`/chats/$chatId`}
                    params={{ chatId: conv.conv_id }}
                    className={`flex items-center gap-3 border-b p-4 hover:bg-muted/50 transition-colors ${currentChatId === conv.conv_id ? 'bg-muted' : ''}`}
                >
                    <Avatar>
                        <AvatarImage src={conv.other_user.u_pfp || undefined} />
                        <AvatarFallback>{conv.other_user.u_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden hidden lg:block">
                        <div className="font-semibold truncate">{conv.other_user.u_name}</div>
                        <div className="text-xs text-muted-foreground truncate">{conv.last_message?.content || 'No messages'}</div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
