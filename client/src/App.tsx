import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import translations from './en.json';
import { store } from './store/store';
import { AuthBootstrap } from './store/AuthBootstrap';

export function App() {
  useEffect(() => {
    document.title = translations.app.title;
  }, []);

  return (
    <Provider store={store}>
      <AuthBootstrap>
        <AppRoutes />
        <Toaster position='top-right' />
      </AuthBootstrap>
    </Provider>
  );
}
