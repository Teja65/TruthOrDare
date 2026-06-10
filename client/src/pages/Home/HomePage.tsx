import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import translations from '../../en.json';
import { notifyInfo } from '../../utils/toastConfig';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RoomChoiceModal } from '../../components/room/RoomChoiceModal';
import { listMyRooms, type RoomSummary } from '../../features/room/roomApi';
import { useAuth } from '../../store/useAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [myRooms, setMyRooms] = useState<RoomSummary[]>([]);

  async function handleCreateClick() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/create' } } });
      return;
    }

    try {
      const rooms = await listMyRooms();
      const running = rooms.filter((room) => room.displayStatus === 'running');
      if (running.length) {
        setMyRooms(rooms);
        setChoiceOpen(true);
        notifyInfo(translations.homePage.roomChoiceToast);
        return;
      }
      navigate('/create');
    } catch {
      navigate('/create');
    }
  }

  return (
    <section className='page-section home-section'>
      <Card className='hero-card'>
        <h2>{translations.homePage.headline}</h2>
        <p className='intro-text'>{translations.homePage.intro}</p>
        <div className='button-row hero-buttons'>
          <Button className='btn-create' onClick={handleCreateClick}>
            {translations.homePage.createRoom}
          </Button>
          <Button variant='secondary' as={Link} to='/join' className='btn-join'>
            {translations.homePage.joinRoom}
          </Button>
          <Button variant='secondary' as={Link} to='/rooms' className='btn-rooms'>
            {translations.homePage.rooms}
          </Button>
        </div>
      </Card>
      <div className='features-grid'>
        {translations.homePage.features.map((feature, index) => (
          <Card className='feature-card' key={feature.title}>
            <span className='feature-icon' aria-hidden='true'>
              {index + 1}
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </Card>
        ))}
      </div>
      <RoomChoiceModal
        open={choiceOpen}
        rooms={myRooms}
        onClose={() => setChoiceOpen(false)}
        onCreateNew={() => {
          setChoiceOpen(false);
          navigate('/create');
        }}
      />
    </section>
  );
}
