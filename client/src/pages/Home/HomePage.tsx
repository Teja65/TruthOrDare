import { Link } from 'react-router-dom';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  return (
    <section className='page-section'>
      <Card className='hero-card'>
        <h2>{translations.homePage.headline}</h2>
        <p>{translations.homePage.summary}</p>
        <div className='button-row'>
          <Button as={Link} to='/create'>
            {translations.homePage.createRoom}
          </Button>
          <Button variant='secondary' as={Link} to='/join'>
            {translations.homePage.joinRoom}
          </Button>
        </div>
      </Card>
    </section>
  );
}
