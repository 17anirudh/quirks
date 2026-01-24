import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/chats')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div>
            <Outlet />
        </div>
    )
}
