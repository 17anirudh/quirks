import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '@/hooks/root-provider'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from "@/hooks/theme-provider"
import { Toaster } from '@/lib/components/ui/sonner'
import { NotFound } from '@/components/404'
import { ErrorComponent } from '@/components/400'
import type { User } from '@supabase/supabase-js'

interface MyRouterContext {
  queryClient: QueryClient
  auth: {
    user: User | null | undefined;
    isLoggedIn: boolean;
    isLoading: boolean;
  };
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster richColors closeButton position='top-right' />
        <Outlet />
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
  notFoundComponent: () => <NotFound />,
  errorComponent: ErrorComponent
})