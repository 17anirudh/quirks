import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SUPABASE_CLIENT } from '@/hooks/utils'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { Button } from '@/lib/components/ui/button'
import { Input } from '@/lib/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar'
import { useAuth } from '@/hooks/auth-provider'
import type { Message, UserProfile } from '@/types'
import Loader from '@/components/loader'

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

    useEffect(() => {
        if (!chatId) return

        const wsUrl = import.meta.env.VITE_BACKEND_URL.replace('http', 'ws') + `/message/chat/${chatId}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            console.log("Connected to chat", chatId)
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                if (msg.sender_qid !== qid) {
                    setLocalMessages(prev => [...prev, msg])
                }
            } catch (e) {
                console.error("WS Parse error", e)
            }
        }

        return () => {
            ws.close()
        }
    }, [chatId, qid])

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current || !qid) return

        const content = input.trim()

        const tempMsg: Message = {
            content,
            m_sender_qid: qid,
            created_at: new Date().toISOString()
        }

        setLocalMessages(prev => [...prev, tempMsg])
        setInput('')

        wsRef.current.send(JSON.stringify({
            content,
            sender_qid: qid
        }))

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
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-2"
                >
                    {allMessages.map((msg, i) => {
                        const isMe = msg.m_sender_qid === qid
                        return (
                            <div
                                key={i}
                                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[70%] rounded-lg p-3 text-sm
                                        ${isMe
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-muted text-foreground rounded-bl-none'
                                        }
                                    `}
                                >
                                    {msg.content}
                                    <div className={`text-[10px] opacity-70 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
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
