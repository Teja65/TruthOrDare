import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import translations from '../en.json';

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='app-shell'>
      <header className='topbar'>
        <div>
          <p className='eyebrow'>{translations.app.subtitle}</p>
          <h1>{translations.app.title}</h1>
        </div>
        <nav className='nav-links'>
          <Link to='/'>Home</Link>
          <Link to='/create'>Create room</Link>
          <Link to='/join'>Join room</Link>
        </nav>
      </header>
      <main className='page-content'>{children}</main>
      <footer className='footer'>
        <span>{translations.app.brand}</span>
        <span>Dark theme ready · Firebase + JWT auth</span>
      </footer>
    </div>
  );
}
