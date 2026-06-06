import { Link } from 'react-router-dom';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  return (
    <section className='page-section home-section'>
      <Card className='hero-card'>
        <h2>{translations.homePage.headline}</h2>
        <p className='intro-text'>{translations.homePage.intro}</p>
        <div className='button-row hero-buttons'>
          <Button as={Link} to='/create' className='btn-create'>
            {translations.homePage.createRoom}
          </Button>
          <Button variant='secondary' as={Link} to='/join' className='btn-join'>
            {translations.homePage.joinRoom}
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
