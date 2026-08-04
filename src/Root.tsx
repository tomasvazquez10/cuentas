import React from 'react';
import App from './App';
import { AuthProvider } from '@context/AuthContext';
import { AppProvider } from '@context/AppContext';

export default function Root() {
  return (
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  );
}
