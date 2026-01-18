<<<<<<< HEAD
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/hooks/theme-provider';
import { Toaster } from 'sonner';
import { NotFound } from '@/components/404';
import { ErrorComponent } from '@/components/400';

import type { QueryClient } from '@tanstack/react-query';
import type { AuthContextValue } from '@/hooks/auth-provider'; //

export interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContextValue; // Use the actual interface
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster richColors closeButton position="top-right" />
        <Outlet />
      </ThemeProvider>
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          { name: 'Router', render: () => <TanStackRouterDevtoolsPanel /> },
          { name: 'Query', render: () => <ReactQueryDevtools initialIsOpen={false} /> },
        ]}
      />
    </>
  ),
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
=======
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
>>>>>>> fix-attempt-backup
