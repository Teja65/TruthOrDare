import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import translations from '../en.json';
import { useAuth } from '../store/useAuth';
import menuDark from '../assests/menu-dark.svg';
import menuLight from '../assests/menu-light.svg';
import footerLogo from '../assests/footer-logo.svg';

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, signOut } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light',
    );
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((value) => !value);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className='app-shell'>
      <header className='topbar'>
        <Link to='/' className='brand-link' onClick={closeMenu}>
          <div className='brand-content'>
            <span className='brand-icon' aria-hidden='true'>
              TOD
            </span>
            <div>
              <h1>{translations.app.title}</h1>
            </div>
          </div>
        </Link>
        <button
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          type='button'
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-label={
            isMenuOpen ? translations.nav.closeMenu : translations.nav.openMenu
          }
          aria-expanded={isMenuOpen}
        >
          <img src={isDark ? menuLight : menuDark} alt='' />
        </button>
        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to='/rooms' className='nav-link' onClick={closeMenu}>
                {translations.nav.rooms}
              </Link>
              <Link to='/profile' className='nav-link profile-link' onClick={closeMenu}>
                {translations.nav.profile}
              </Link>
              <button
                type='button'
                className='nav-link nav-action'
                onClick={() => {
                  signOut();
                  toast.success(translations.toast.signedOut);
                  closeMenu();
                }}
              >
                {translations.auth.signOut}
              </button>
            </>
          ) : (
            <>
              <Link to='/' className='nav-link' onClick={closeMenu}>
                {translations.nav.home}
              </Link>
              <Link to='/login' className='nav-link nav-action' onClick={closeMenu}>
                {translations.auth.signIn}
              </Link>
            </>
          )}
          <button
            className='nav-link theme-toggle'
            onClick={() => {
              toggleTheme();
              closeMenu();
            }}
            title={translations.nav.toggleTheme}
            aria-label={translations.nav.toggleTheme}
          >
            {isDark ? translations.nav.lightTheme : translations.nav.darkTheme}
          </button>
        </nav>
      </header>
      <main className='page-content'>{children}</main>
      <footer className='footer'>
        <div className='footer-inner'>
          <div className='footer-brand'>
            <img src={footerLogo} alt='' className='footer-logo' />
            <div>
              <strong>{translations.app.brand}</strong>
              <p>{translations.footer.tagline}</p>
            </div>
          </div>
          <div className='footer-meta'>
            <span>{translations.footer.license}</span>
            <span>{translations.footer.copyright}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
