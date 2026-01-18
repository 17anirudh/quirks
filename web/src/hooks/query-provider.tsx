import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
<<<<<<< HEAD:web/src/hooks/query-provider.tsx
=======

export default {
  name: 'Tanstack Query',
  render: <ReactQueryDevtoolsPanel />,
}
>>>>>>> fix-attempt-backup:web/src/hooks/root-provider.tsx

export function getContext() {
  const queryClient = new QueryClient()
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default {
  name: 'Tanstack Query',
  render: <ReactQueryDevtoolsPanel />,
}

