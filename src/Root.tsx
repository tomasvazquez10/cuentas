import React from 'react';
import App from './App';
import { AuthProvider } from '@context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@lib/queryClient';

export default function Root() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </AuthProvider>
  );
}
