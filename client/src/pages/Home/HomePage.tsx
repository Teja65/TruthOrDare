import { Link, useNavigate } from 'react-router-dom';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../store/useAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  function handleCreateClick() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/create' } } });
      return;
    }
    navigate('/create');
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
    </section>
  );
}
