import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import squareUser from '../../assests/square-user.svg';

export function ProfilePage() {
  const { user } = useAuth();
  const displayName =
    user?.displayName || user?.email || translations.profilePage.anonymous;

  return (
    <section className='page-section profile-section'>
      <Card className='profile-card'>
        <div className='profile-avatar'>
          <img src={squareUser} alt='' />
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
              <span>{translations.profilePage.status}</span>
              <strong>{translations.profilePage.signedIn}</strong>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
