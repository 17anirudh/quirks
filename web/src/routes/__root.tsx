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