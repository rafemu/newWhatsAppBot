import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import router from './routes';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './components/NotificationProvider';

// Create a client
const queryClient = new QueryClient();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  </React.StrictMode>
); 