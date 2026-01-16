import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/_chats/view')({
    component: () => {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <p>Select a conversation to start messaging</p>
            </div>
        )
    }
})

