import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../store/useAuth';
import { listMyRooms } from '../../features/room/roomApi';
import squareUserIcon from '../../assests/square-user.svg';

export function ProfilePage() {
  const { user } = useAuth();
  const [roomStats, setRoomStats] = useState({ total: 0, running: 0, ended: 0 });

  const displayName =
    user?.displayName || user?.email || translations.profilePage.anonymous;
  const email = user?.email ?? translations.profilePage.noEmail;
  const providerLabel =
    user?.provider === 'google'
      ? translations.profilePage.google
      : translations.profilePage.emailProvider;

  useEffect(() => {
    listMyRooms()
      .then((rooms) => {
        setRoomStats({
          total: rooms.length,
          running: rooms.filter((room) => room.displayStatus === 'running').length,
          ended: rooms.filter((room) => room.displayStatus === 'ended').length,
        });
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className='page-section form-page profile-section'>
      <Card className='profile-card'>
        <div className='profile-hero'>
          <div className='profile-avatar themed-avatar'>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={displayName}
                className='profile-photo'
                referrerPolicy='no-referrer'
              />
            ) : (
              <img src={squareUserIcon} alt='' className='profile-icon' />
            )}
          </div>
          <div className='profile-identity'>
            <p className='eyebrow'>{translations.profilePage.member}</p>
            <h2>{displayName}</h2>
            <p className='profile-email'>{email}</p>
            <span className='profile-provider-badge'>{providerLabel}</span>
          </div>
        </div>

        <div className='profile-stats'>
          <div className='profile-stat'>
            <strong>{roomStats.total}</strong>
            <span>{translations.profilePage.totalRooms}</span>
          </div>
          <div className='profile-stat'>
            <strong>{roomStats.running}</strong>
            <span>{translations.profilePage.runningRooms}</span>
          </div>
          <div className='profile-stat'>
            <strong>{roomStats.ended}</strong>
            <span>{translations.profilePage.endedRooms}</span>
          </div>
        </div>

        <div className='profile-details'>
          <div>
            <span>{translations.profilePage.name}</span>
            <strong>{displayName}</strong>
          </div>
          <div>
            <span>{translations.profilePage.email}</span>
            <strong>{email}</strong>
          </div>
          <div>
            <span>{translations.profilePage.provider}</span>
            <strong>{providerLabel}</strong>
          </div>
          <div>
            <span>{translations.profilePage.status}</span>
            <strong>{translations.profilePage.signedIn}</strong>
          </div>
        </div>

        <div className='profile-actions button-row small-gap'>
          <Button as={Link} to='/create'>
            {translations.homePage.createRoom}
          </Button>
          <Button as={Link} to='/join' variant='secondary'>
            {translations.homePage.joinRoom}
          </Button>
        </div>
      </Card>
    </section>
  );
}
