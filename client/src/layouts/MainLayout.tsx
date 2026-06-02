import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import translations from '../en.json';
import { useAuth } from '../contexts/AuthContext';

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const { user, signOut } = useAuth();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light',
    );
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((value) => !value);
  };

  return (
    <div className='app-shell'>
      <header className='topbar'>
        <Link to='/' className='brand-link'>
          <div className='brand-content'>
            <i className='fas fa-fire brand-icon'></i>
            <div>
              <h1>{translations.app.title}</h1>
            </div>
          </div>
        </Link>
        <nav className='nav-links'>
          <Link to='/' className='nav-link'>
            Home
          </Link>
          <Link to='/create' className='nav-link'>
            Create Room
          </Link>
          <Link to='/join' className='nav-link'>
            Join Room
          </Link>
          {user ? (
            <button
              type='button'
              className='button secondary nav-action'
              onClick={signOut}
            >
              {translations.auth.signOut}
            </button>
          ) : (
            <Link to='/login' className='button secondary nav-action'>
              {translations.auth.signIn}
            </Link>
          )}
          <button
            className='button theme-toggle'
            onClick={toggleTheme}
            title='Toggle theme'
            aria-label='Toggle theme'
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </header>
      <main className='page-content'>{children}</main>
      <footer className='footer'>
        <span>{translations.app.brand}</span>
      </footer>
    </div>
  );
}
