import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import TanStackQueryDevtools from '@/hooks/root-provider'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from "@/hooks/theme-provider"
import { Toaster } from '@/lib/components/ui/sonner'
import { NotFound } from '@/components/404'
import { ErrorComponent } from '@/components/400'
import { useAuth } from '@/hooks/auth-provider'
import Loader from '@/components/loader'
import { Suspense } from 'react'

interface MyRouterContext {
  queryClient: QueryClient
  auth: ReturnType<typeof useAuth>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    const { isLoading } = useAuth()
    return (
      <>

        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <Toaster richColors closeButton position='top-right' />
          {isLoading ? (
            <Loader />
          ) : (
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          )}
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
    )
  },
  notFoundComponent: () => <NotFound />,
  errorComponent: ErrorComponent
})