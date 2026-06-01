import { Link } from 'react-router-dom';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  return (
    <section className='page-section home-section'>
      <Card className='hero-card'>
        <div className='hero-icon'>
          <i className='fas fa-dice'></i>
        </div>
        <h2>{translations.homePage.headline}</h2>
        <p className='intro-text'>{translations.homePage.intro}</p>
        <div className='button-row hero-buttons'>
          <Button as={Link} to='/create' className='btn-create'>
            <i className='fas fa-plus-circle'></i>
            {translations.homePage.createRoom}
          </Button>
          <Button variant='secondary' as={Link} to='/join' className='btn-join'>
            <i className='fas fa-door-open'></i>
            {translations.homePage.joinRoom}
          </Button>
        </div>
      </Card>
      <div className='features-grid'>
        <Card className='feature-card'>
          <i className='fas fa-users feature-icon'></i>
          <h3>Multiplayer Fun</h3>
          <p>Play with 2+ players in real-time with shared scores.</p>
        </Card>
        <Card className='feature-card'>
          <i className='fas fa-list feature-icon'></i>
          <h3>5 Categories</h3>
          <p>Normal, Funny, Friends, Couples, and Spicy modes.</p>
        </Card>
        <Card className='feature-card'>
          <i className='fas fa-trophy feature-icon'></i>
          <h3>Scoreboard</h3>
          <p>Track scores and crown the party champion.</p>
        </Card>
      </div>
    </section>
  );
}
