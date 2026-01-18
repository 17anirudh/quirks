import { createFileRoute, Outlet, Link, redirect } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
    PopcornIcon,
    HomeIcon,
    MessageCircle,
    UserCircle2Icon,
} from 'lucide-react'
import Loader from '@/components/loader'

export const Route = createFileRoute('/_protected')({
    beforeLoad: ({ context, location }) => {
        const { user, isLoading } = context.auth   // ← from useAuth() which uses the query`
        // This is the critical part you probably forgot:
        if (isLoading) {
            // ← Do NOTHING here — don't redirect yet!
            return
        }

        if (!user) {
            throw redirect({
                to: '/',
                search: { redirect: location.href },
            })
        }
    },
    pendingComponent: () => <Loader />,
    component: RouteComponent,
})

type navType = {
    display: string;
    path: string;
    icon: ReactNode;
    value: string;
}

const navigations: navType[] = [
    {
        display: "Posts",
        path: '/posts/home',
        icon: <PopcornIcon height={27} />,
        value: 'posts'
    },
    {
        display: "Home",
        path: '/home',
        icon: <HomeIcon height={27} />,
        value: 'home'
    },
    {
        display: "Chats",
        path: '/chats',
        icon: <MessageCircle height={27} />,
        value: 'chats'
    },
    {
        display: "Profile",
        path: '/profile/home',
        icon: <UserCircle2Icon height={27} />,
        value: 'profile'
    }
]


function RouteComponent() {
    return (
        <div className="flex flex-col h-dvh w-screen">
            <main className="fixed top-0 left-0 right-0 z-50 border-b flex-1 overflow-auto h-full">
                <Outlet />
            </main>
            <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 h-12 bg-background">
                <nav>
                    <div className="flex flex-row h-full items-center">
                        {navigations.map((item, index) => (
                            <Link
                                to={item.path}
                                key={index}
                                activeProps={{ className: "text-white" }}
                                inactiveProps={{ className: "text-gray-500" }}
                                className="flex-1 flex justify-center items-center h-full"
                            >
                                {item.icon}
                            </Link>
                        ))}
                    </div>
                </nav>
            </footer>
        </div>
    )
}
