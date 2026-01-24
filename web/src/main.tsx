import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import * as TanStackQueryProvider from './hooks/root-provider.tsx'
import { routeTree } from './routeTree.gen'
import './styles.css'
import { useAuth, AuthProvider } from './hooks/auth-provider.tsx'
import reportWebVitals from './reportWebVitals.ts'

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
    queryClient: TanStackQueryProviderContext.queryClient,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  // 3. Call your hook inside a child of the QueryProvider
  const auth = useAuth()

  // 4. Pass the live auth state to the Router
  return (
    <RouterProvider
      router={router}
      context={{
        auth,
        queryClient: TanStackQueryProviderContext.queryClient
      }}
    />
  )
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </TanStackQueryProvider.Provider>
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
