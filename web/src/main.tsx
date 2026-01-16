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

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, //
    queryClient: TanStackQueryProviderContext.queryClient,
  } as RouterContext, // THIS CAST BREAKS THE LOOP
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
  const auth = useAuth(); //
  return (
    <RouterProvider
      router={router}
      context={{
        auth,
        queryClient: TanStackQueryProviderContext.queryClient
      }}
    />
  );
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