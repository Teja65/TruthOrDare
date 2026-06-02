import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import translations from '../../en.json';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  hasFirebaseConfig,
  signInUser,
  signInWithGoogle,
} from '../../firebase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasFirebaseConfig) {
      setError(translations.auth.missingCredentials);
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError(translations.auth.errorDefault);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInUser(email.trim(), password.trim());
      navigate('/');
    } catch (error) {
      setError(translations.auth.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasFirebaseConfig) {
      setError(translations.auth.missingCredentials);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError(translations.auth.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-section auth-section'>
      <Card className='auth-card'>
        <h2>{translations.auth.signIn}</h2>
        <p>
          {translations.auth.signIn} with your email or Google account to
          continue.
        </p>

        <form className='form-stack' onSubmit={handleSubmit}>
          <Input
            label={translations.auth.email}
            placeholder={
              translations.form.placeholderEmail || 'you@example.com'
            }
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Input
            label={translations.auth.password}
            placeholder={translations.form.placeholderPassword || '••••••••'}
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && <p className='form-error'>{error}</p>}
          <Button type='submit' disabled={loading}>
            {translations.auth.continue}
          </Button>
        </form>

        <Button
          type='button'
          variant='secondary'
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <i className='fab fa-google'></i>
          {translations.auth.withGoogle}
        </Button>
      </Card>
    </section>
  );
}
