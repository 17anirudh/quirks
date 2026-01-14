import { createFileRoute, Outlet, Link, redirect } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
    PopcornIcon,
    HomeIcon,
    MessageCircle,
    UserCircle2Icon,
} from 'lucide-react'
import { SUPABASE_CLIENT } from '@/hooks/variables'
import Loader from '@/components/loader'
import { Scroller } from '@/lib/components/ui/scroller'

export const Route = createFileRoute('/_protected')({
    beforeLoad: async () => {
        const { data: { session } } = await SUPABASE_CLIENT.auth.getSession()
        if (!session) { 
            throw redirect({ to: '/', replace: true })
        }        
        return { 
            qid: session.user.user_metadata?.u_qid 
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
        path: '/posts',
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
        path: '/profile',
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
