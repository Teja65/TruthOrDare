import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import translations from '../en.json';

type GuardedRouteProps = {
  children: ReactNode;
};

export function GuardedRoute({ children }: GuardedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className='route-loading'>{translations.app.loading}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  return children;
}
