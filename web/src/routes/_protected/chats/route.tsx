import Loader from '@/components/loader'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/chats')({
    component: RouteComponent,
    pendingComponent: () => <Loader />,
    pendingMinMs: 0
})

function RouteComponent() {
    return (
        <div>
            <Outlet />
        </div>
    )
}
