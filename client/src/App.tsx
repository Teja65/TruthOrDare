import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import translations from './en.json';

export function App() {
  useEffect(() => {
    document.title = translations.app.title;
  }, []);

  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position='top-right' />
    </AuthProvider>
  );
}
