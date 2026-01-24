import { createFileRoute } from '@tanstack/react-router'
import { MessageSquareDashed } from 'lucide-react'

export const Route = createFileRoute('/_protected/chats/')({
    component: Index,
})

function Index() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center text-center p-8 text-muted-foreground">
            <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                <MessageSquareDashed className="h-10 w-10 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your Messages</h2>
            <p className="max-w-xs">
                Select a conversation from the left to start chatting or find someone new to talk to.
            </p>
        </div>
    )
}
