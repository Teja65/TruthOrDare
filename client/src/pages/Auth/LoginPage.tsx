import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import translations from '../../en.json';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  hasFirebaseConfig,
  signInUser,
  signInWithGoogle,
} from '../../firebase';
import {
  getFieldError,
  loginSchema,
} from '../../utils/validation';

type RouteState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', form: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const routeState = location.state as RouteState | null;
  const redirectTo = routeState?.from?.pathname ?? '/profile';

  function validateEmail(value: string) {
    const result = loginSchema.shape.email.safeParse(value);
    setErrors((current) => ({
      ...current,
      email: result.success ? '' : result.error.issues[0]?.message ?? '',
      form: '',
    }));
  }

  function validatePassword(value: string) {
    const result = loginSchema.shape.password.safeParse(value);
    setErrors((current) => ({
      ...current,
      password: result.success ? '' : result.error.issues[0]?.message ?? '',
      form: '',
    }));
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasFirebaseConfig) {
      setErrors({
        email: '',
        password: '',
        form: translations.auth.missingCredentials,
      });
      return;
    }

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setErrors({
        email: getFieldError(result.error, 'email') ?? '',
        password: getFieldError(result.error, 'password') ?? '',
        form: '',
      });
      return;
    }

    setLoading(true);
    setErrors({ email: '', password: '', form: '' });

    try {
      await signInUser(result.data.email, result.data.password);
      toast.success(translations.toast.signedIn);
      navigate(redirectTo);
    } catch (error) {
      setErrors({ email: '', password: '', form: translations.auth.errorDefault });
      toast.error(translations.auth.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasFirebaseConfig) {
      setErrors({
        email: '',
        password: '',
        form: translations.auth.missingCredentials,
      });
      return;
    }

    setLoading(true);
    setErrors({ email: '', password: '', form: '' });

    try {
      await signInWithGoogle();
      toast.success(translations.toast.signedIn);
      navigate(redirectTo);
    } catch (error) {
      setErrors({ email: '', password: '', form: translations.auth.errorDefault });
      toast.error(translations.auth.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-section auth-section form-page'>
      <Card className='auth-card form-card slim'>
        <div className='form-hero'>
          <h2>{translations.auth.signIn}</h2>
          <p>{translations.auth.description}</p>
        </div>

        <form className='form-stack form-panel' onSubmit={handleSubmit}>
          <Input
            label={translations.auth.email}
            placeholder={translations.form.placeholderEmail}
            type='email'
            value={email}
            error={errors.email}
            onBlur={() => {
              setTouched((current) => ({ ...current, email: true }));
              validateEmail(email);
            }}
            onChange={(event) => {
              setEmail(event.target.value);
              if (touched.email) {
                validateEmail(event.target.value);
              }
            }}
          />
          <Input
            label={translations.auth.password}
            placeholder={translations.form.placeholderPassword}
            type='password'
            value={password}
            error={errors.password}
            onBlur={() => {
              setTouched((current) => ({ ...current, password: true }));
              validatePassword(password);
            }}
            onChange={(event) => {
              setPassword(event.target.value);
              if (touched.password) {
                validatePassword(event.target.value);
              }
            }}
          />
          {errors.form && <p className='form-error'>{errors.form}</p>}
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
          {translations.auth.withGoogle}
        </Button>
      </Card>
    </section>
  );
}
