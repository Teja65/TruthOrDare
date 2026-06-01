import { Link } from 'react-router-dom';
import translations from '../../en.json';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <section className='page-section notfound-page'>
      <Card className='center-card'>
        <h2>{translations.notFoundPage.title}</h2>
        <p>{translations.notFoundPage.message}</p>
        <Button as={Link} to='/'>
          {translations.notFoundPage.goHome}
        </Button>
      </Card>
    </section>
  );
}
