import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SUPABASE_CLIENT } from '@/hooks/utils'
import { Loader2, MessageSquare, RefreshCw } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar'
import { Button } from '@/lib/components/ui/button'
import type { Conversation } from '@/types'
import Loader from '@/components/loader'

export const Route = createFileRoute('/_protected/chats/')({
    component: MessagesLayout,
    pendingComponent: () => <Loader />,
    pendingMinMs: 0
})

function MessagesLayout() {
    const { data: conversations, isLoading, error, refetch } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const { data: { session } } = await SUPABASE_CLIENT.auth.getSession();
            if (!session) throw new Error("Unauthorized");

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/message/list`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error('[FRONTEND] Failed to fetch conversations:', res.status, errorText);
                throw new Error("Failed to fetch conversations");
            }
            const data = await res.json();
            console.log('[FRONTEND] Fetched conversations:', data.conversations?.length || 0);
            return data.conversations as Conversation[];
        },
        refetchInterval: 5000, // Auto-refetch every 5 seconds
    });

    if (isLoading) return <Loader />

    if (error) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
                <div className="text-red-500">Error loading messages</div>
                <Button onClick={() => refetch()} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden">
            <div className="flex w-full flex-col border-r md:w-1/3 lg:w-1/4">
                <div className="border-b p-4 flex justify-between items-center">
                    <h1 className="font-bold text-xl">Messages</h1>
                    <Button onClick={() => refetch()} variant="ghost" size="icon">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations?.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground font-medium mb-2">No conversations yet</p>
                            <p className="text-sm text-muted-foreground">
                                Start a conversation by clicking "Message" on someone's profile
                            </p>
                        </div>
                    ) : (
                        conversations?.map((conv) => (
                            <Link
                                key={conv.conv_id}
                                to={`/chats/$chatId`}
                                params={{ chatId: conv.conv_id }}
                                className="flex items-center gap-3 border-b p-4 hover:bg-muted/50 transition-colors"
                            >
                                <Avatar>
                                    <AvatarImage src={conv.other_user.u_pfp || undefined} />
                                    <AvatarFallback>{conv.other_user.u_name?.[0] || conv.other_user.u_qid[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 overflow-hidden min-w-0">
                                    <div className="flex justify-between items-baseline gap-2">
                                        <div className="font-semibold truncate">{conv.other_user.u_name || conv.other_user.u_qid}</div>
                                        {conv.last_message && (
                                            <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
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
                                            <span className="italic">No messages yet</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Desktop Placeholder */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/10">
                <div className="flex flex-col items-center gap-4 text-muted-foreground max-w-sm text-center p-8">
                    <MessageSquare size={64} className="opacity-50" />
                    <div>
                        <p className="font-semibold text-lg mb-2">Select a conversation</p>
                        <p className="text-sm">Choose a chat from the left to start messaging</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
