<<<<<<< HEAD
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { AuthProvider, useAuth } from './hooks/auth-provider';
import * as TanStackQueryProvider from './hooks/query-provider';
import { type RouterContext } from './routes/__root'; //
import './styles.css';
import reportWebVitals from './reportWebVitals';

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
=======
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import * as TanStackQueryProvider from './hooks/root-provider.tsx'
import { routeTree } from './routeTree.gen'
import './styles.css'
import { useAuth, AuthProvider } from './hooks/auth-provider.tsx'
import reportWebVitals from './reportWebVitals.ts'
>>>>>>> fix-attempt-backup

const router = createRouter({
  routeTree,
  context: {
<<<<<<< HEAD
    auth: undefined!, //
    queryClient: TanStackQueryProviderContext.queryClient,
  } as RouterContext, // THIS CAST BREAKS THE LOOP
=======
    auth: undefined!,
    queryClient: TanStackQueryProviderContext.queryClient,
  },
>>>>>>> fix-attempt-backup
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
<<<<<<< HEAD
  const auth = useAuth(); //
=======
  // 3. Call your hook inside a child of the QueryProvider
  const auth = useAuth()

  // 4. Pass the live auth state to the Router
>>>>>>> fix-attempt-backup
  return (
    <RouterProvider
      router={router}
      context={{
        auth,
        queryClient: TanStackQueryProviderContext.queryClient
      }}
    />
<<<<<<< HEAD
  );
=======
  )
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
>>>>>>> fix-attempt-backup
}

const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TanStackQueryProvider.Provider>
    </StrictMode>
  );
}

reportWebVitals();