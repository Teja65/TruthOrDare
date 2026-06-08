import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../store/useAuth';
import squareUserIcon from '../../assests/square-user.svg';

export function ProfilePage() {
  const { user } = useAuth();
  const displayName =
    user?.displayName || user?.email || translations.profilePage.anonymous;

  return (
    <section className='page-section profile-section'>
      <Card className='profile-card'>
        <div className='profile-avatar themed-avatar'>
          <img src={squareUserIcon} alt='' className='profile-icon' />
        </div>
        <div className='profile-content'>
          <p className='eyebrow'>{translations.profilePage.status}</p>
          <h2>{translations.profilePage.heading}</h2>
          <p>{translations.profilePage.description}</p>
          <div className='profile-details'>
            <div>
              <span>{translations.profilePage.name}</span>
              <strong>{displayName}</strong>
            </div>
            <div>
              <span>{translations.profilePage.email}</span>
              <strong>{user?.email ?? displayName}</strong>
            </div>
            <div>
              <span>{translations.profilePage.provider}</span>
              <strong>
                {user?.provider === 'google'
                  ? translations.profilePage.google
                  : translations.profilePage.emailProvider}
              </strong>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
