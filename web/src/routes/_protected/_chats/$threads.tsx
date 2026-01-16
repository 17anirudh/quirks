import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/_chats/$threads')({
    component: RouteComponent,
})

function RouteComponent() {
    // const { threadId } = Route.useParams()

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b bg-background/80 backdrop-blur-md">
                <p className="font-bold">Chatting with { }</p>
            </header>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse gap-2">
                {/* Your GAIA UI Message Bubbles go here */}
                <div className="self-end bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none">
                    Optimistic message for { }!
                </div>
            </div>

            <footer className="p-4 border-t">
                <input
                    className="w-full bg-muted rounded-full px-4 py-2 outline-none"
                    placeholder="Type a message..."
                />
            </footer>
        </div>
    )
}
