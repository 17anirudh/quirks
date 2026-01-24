
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SUPABASE_CLIENT } from '@/hooks/utils'
import { Loader2, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar'
import type { Conversation } from '@/types'



export const Route = createFileRoute('/_protected/messages/')({
    component: MessagesLayout,
})

function MessagesLayout() {
    // 1. Fetch Conversations
    const { data: conversations, isLoading, error } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
            if (!session) throw new Error("Unauthorized");

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/message/list`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) throw new Error("Failed to fetch conversations");
            const data = await res.json();
            return data.conversations as Conversation[];
        }
    });

    if (isLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (error) return <div className="p-4 text-red-500">Error loading messages</div>

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
            {/* Conversation List - Hidden on mobile if viewing specific chat (handled by router outlet usually, but for index route we show list) */}
            <div className="flex w-full flex-col border-r md:w-1/3 lg:w-1/4">
                <div className="border-b p-4 font-bold text-xl">Messages</div>
                <div className="flex-1 overflow-y-auto">
                    {conversations?.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">No conversations yet.</div>
                    ) : (
                        conversations?.map((conv) => (
                            <Link
                                key={conv.conv_id}
                                to={`/messages/$chatId`}
                                params={{ chatId: conv.conv_id }}
                                className="flex items-center gap-3 border-b p-4 hover:bg-muted/50 transition-colors"
                            >
                                <Avatar>
                                    <AvatarImage src={conv.other_user.u_pfp || undefined} />
                                    <AvatarFallback>{conv.other_user.u_name?.[0] || conv.other_user.u_qid[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-semibold truncate">{conv.other_user.u_name || conv.other_user.u_qid}</div>
                                        {conv.last_message && (
                                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                                                {new Date(conv.last_message.created_at).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="truncate text-sm text-muted-foreground">
                                        {conv.last_message ? (
                                            <span>
                                                {conv.last_message.m_sender_qid === conv.other_user.u_qid ? '' : 'You: '}
                                                {conv.last_message.content}
                                            </span>
                                        ) : (
                                            <span className="italic">No messages</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Desktop Placeholder / Outlet */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/10">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MessageSquare size={48} />
                    <p>Select a conversation to start chatting</p>
                </div>
            </div>
        </div>
    )
}
