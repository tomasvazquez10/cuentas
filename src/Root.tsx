import React from 'react';
import App from './App';
import { AuthProvider } from '@context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@lib/queryClient';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
