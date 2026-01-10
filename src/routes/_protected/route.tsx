import { createFileRoute, redirect, Outlet, Link } from '@tanstack/react-router'
import { supabase } from '@/supabase/variables'
import MusicDynamicIsland from '@/components/music-dymanic'
import Settings from '@/components/settings'
import type { ReactNode } from 'react'
import {
    PopcornIcon,
    HomeIcon,
    MessageCircle,
    UserCircle2Icon,
} from 'lucide-react'

export const Route = createFileRoute('/_protected')({
    beforeLoad: async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!session && error) {
            throw redirect({ to: '/', replace: true })
        }
    },
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
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background h-14">
            <div className="flex items-center justify-between px-4 h-full">
                <h1 className="text-xl font-semibold">QUIRKS</h1>
                <MusicDynamicIsland />
                <Settings />
            </div>
        </header>

        <main className="flex-1 overflow-auto pt-14 pb-12">
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
