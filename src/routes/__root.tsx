import { Outlet, createRootRouteWithContext, Link, redirect } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from '@/components/ui/sonner'
import { 
  PopcornIcon, 
  HomeIcon, 
  MessageCircle, 
  UserCircle2Icon,
} from 'lucide-react'
import { type ReactNode } from 'react'
import Settings from '@/components/settings'
import { supabase } from '@/supabase/variables'
import Loader from '@/components/loader'

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
    path: '/',
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

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const session = await supabase.auth.getSession()
    if (session.error || !session.data) {
      redirect({to:'/onboard'})
    }
  },
  loader: () => <Loader />,
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster richColors closeButton position='top-right' />
        <div className="flex flex-col h-screen w-screen">
          <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background h-14">
            <div className="flex items-center justify-between px-4 h-full">
              <h1 className="text-xl font-semibold">QUIRKS</h1>
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
      </ThemeProvider>
      <TanStackDevtools
        config={{
          position: 'top-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  ),
})
