import { createFileRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/_chats')({
    component: RouteComponent,
})

const MOCK_THREADS = [
    { id: 'user_123', name: 'Gojo Satoru', lastMsg: 'Infinite Void is ready.' },
    { id: 'user_456', name: 'Makima', lastMsg: 'Are you listening?' },
    { id: 'user_789', name: 'TanStack Bot', lastMsg: 'Query invalidation complete.' },
]

function RouteComponent() {
    return (
        <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden">
            {/* SIDEBAR: Visible on Desktop, hidden on Mobile if a chat is active */}
            <aside className="w-full md:w-80 border-r flex flex-col shrink-0">
                {/* ... Header logic ... */}
                <div className="flex-1 overflow-y-auto">
                    {MOCK_THREADS.map(thread => (
                        <Link
                            key={thread.id}
                            // The path follows your folder structure
                            to="/$threads"
                            params={{ threadId: thread.id }}
                            activeProps={{ className: 'bg-muted border-r-4 border-primary' }}
                            className="block p-4 border-b hover:bg-muted/50 transition-colors"
                        >
                            <p className="font-bold text-sm truncate">{thread.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{thread.lastMsg}</p>
                        </Link>
                    ))}
                </div>
            </aside>

            {/* CHAT CONTENT */}
            <main className="flex-1 relative bg-background">
                <Outlet />
            </main>
        </div>
    )
}
