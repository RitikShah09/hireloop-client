'use client';

import { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store, persistor } from '@/store';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
            gcTime: 1000 * 60 * 10,
          },
          mutations: { retry: 0 },
        },
      })
  );

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(0 0% 100%)',
                color: 'hsl(220 20% 10%)',
                border: '1px solid hsl(220 14% 90%)',
                borderRadius: '10px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: 'hsl(160 60% 38%)', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: 'hsl(0 72% 51%)', secondary: '#fff' },
              },
            }}
          />
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
