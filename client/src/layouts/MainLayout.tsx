import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import translations from '../en.json';

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'light' : 'dark',
    );
  };

  return (
    <div className='app-shell'>
      <header className='topbar'>
        <Link to='/' className='brand-link'>
          <div className='brand-content'>
            <i className='fas fa-fire brand-icon'></i>
            <div>
              <p className='eyebrow'>{translations.app.subtitle}</p>
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
          <button
            className='theme-toggle'
            onClick={toggleTheme}
            title='Toggle theme'
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </header>
      <main className='page-content'>{children}</main>
      <footer className='footer'>
        <span>
          <i className='fas fa-gamepad'></i> {translations.app.brand}
        </span>
        <span>Professional dark theme · Firebase + JWT auth</span>
      </footer>
    </div>
  );
}
