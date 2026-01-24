import { createFileRoute, Outlet, Link, redirect } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
    PopcornIcon,
    HomeIcon,
    MessageCircle,
    UserCircle2Icon,
} from 'lucide-react'
import Loader from '@/components/loader'
import { TimerProvider } from '@/hooks/time-provider'

type queryResponse = {
    user: {
        u_qid: string | null,
        u_bio: string | null,
        u_pfp: string | null,
        u_name: string | null
    },
    post: [
        {
            p_id: string | null,
            p_author_qid: string | null,
            p_text: string | null,
            p_likes_count: number | null,
            p_comments_count: number | null,
            created_at: string | null,
            p_url: string | null
            p_author_pfp: string | null
        }
    ],
    relation: Array<any | null>,
    pending: Array<any | null>
}

export const Route = createFileRoute('/_protected')({
    loader: async ({ context }) => {
        const session = await context.auth.waitForAuth()
        if (session === null) {
            throw redirect({ to: '/', replace: true })
        }
        const qid = session.user.user_metadata.u_qid
        console.log(qid)
        return await context.queryClient.ensureQueryData({
            queryKey: ['me'],
            queryFn: async () => {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/me`, {
                    headers: {
                        id: qid
                    }
                })

                if (!res.ok) {
                    throw new Error('Failed to fetch profile')
                }

                return await res.json() as queryResponse
            }
        })
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
        <div className="flex flex-col h-dvh w-screen overflow-hidden">
            <main className="flex-1 overflow-hidden relative flex flex-col">
                <TimerProvider>
                    <Outlet />
                </TimerProvider>
            </main>
            <footer className="border-t border-gray-800 h-12 bg-background flex-none z-50">
                <nav className="h-full">
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

