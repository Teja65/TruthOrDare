import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import translations from '../../en.json';
import { notifyError, notifySuccess } from '../../utils/toastConfig';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  createUser,
  emailPasswordProvider,
  hasFirebaseConfig,
  getEmailSignInMethods,
  googleSignInProvider,
  signInUser,
  signInWithGoogle,
} from '../../utils/firebase';
import {
  getFieldError,
  loginSchema,
  signUpSchema,
} from '../../utils/validation';

type RouteState = {
  from?: {
    pathname?: string;
  };
};

function getFirebaseCode(error: unknown) {
  return typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
    ? error.code
    : '';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    form: '',
  });
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const routeState = location.state as RouteState | null;
  const redirectTo = routeState?.from?.pathname ?? '/';

  function validateUsername(value: string) {
    if (mode !== 'signUp') return;
    const result = signUpSchema.shape.username.safeParse(value);
    setErrors((current) => ({
      ...current,
      username: result.success ? '' : result.error.issues[0]?.message ?? '',
      form: '',
    }));
  }

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
        username: '',
        email: '',
        password: '',
        form: translations.auth.missingCredentials,
      });
      return;
    }

    const schema = mode === 'signUp' ? signUpSchema : loginSchema;
    const result = schema.safeParse(
      mode === 'signUp' ? { username, email, password } : { email, password },
    );
    if (!result.success) {
      setErrors({
        username: getFieldError(result.error, 'username') ?? '',
        email: getFieldError(result.error, 'email') ?? '',
        password: getFieldError(result.error, 'password') ?? '',
        form: '',
      });
      return;
    }

    setLoading(true);
    setErrors({ username: '', email: '', password: '', form: '' });

    try {
      if (mode === 'signUp') {
        const signUpData = result.data as {
          username: string;
          email: string;
          password: string;
        };
        sessionStorage.setItem('tod-pending-username', signUpData.username);
        await createUser(
          signUpData.email,
          signUpData.password,
          signUpData.username,
        );
        notifySuccess(translations.loginProvider.signUpSuccess);
      } else {
        const methods = await getEmailSignInMethods(result.data.email);
        if (
          methods.includes(googleSignInProvider) &&
          !methods.includes(emailPasswordProvider)
        ) {
          setErrors({
            username: '',
            email: '',
            password: '',
            form: translations.loginProvider.useGoogle,
          });
          notifyError(translations.loginProvider.useGoogle);
          return;
        }

        await signInUser(result.data.email, result.data.password);
        notifySuccess(translations.loginProvider.emailSuccess);
      }
      navigate(redirectTo);
    } catch (error) {
      const code = getFirebaseCode(error);
      let message =
        code === 'auth/email-already-in-use'
          ? translations.loginProvider.useEmail
          : code === 'auth/invalid-credential' || code === 'auth/wrong-password'
          ? translations.auth.invalidCredentials
          : code === 'auth/user-not-found'
            ? translations.auth.emailNotFound
            : code === 'auth/too-many-requests'
              ? translations.auth.tooManyRequests
              : translations.auth.errorDefault;

      try {
        const methods = await getEmailSignInMethods(result.data.email);
        if (methods.includes(googleSignInProvider)) {
          message = translations.loginProvider.useGoogle;
        }
      } catch {
        message = translations.auth.errorDefault;
      }

      setErrors({ username: '', email: '', password: '', form: message });
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!hasFirebaseConfig) {
      setErrors({
        username: '',
        email: '',
        password: '',
        form: translations.auth.missingCredentials,
      });
      return;
    }

    setLoading(true);
    setErrors({ username: '', email: '', password: '', form: '' });

    try {
      await signInWithGoogle();
      notifySuccess(translations.loginProvider.googleSuccess);
      navigate(redirectTo);
    } catch (error) {
      const code = getFirebaseCode(error);
      const message =
        code === 'auth/account-exists-with-different-credential'
          ? translations.loginProvider.useEmail
          : translations.auth.errorDefault;

      setErrors({ username: '', email: '', password: '', form: message });
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='page-section auth-section form-page'>
      <Card className='auth-card form-card slim'>
        <div className='form-hero'>
          <h2>
            {mode === 'signIn'
              ? translations.auth.signIn
              : translations.auth.signUp}
          </h2>
          <p>{translations.auth.description}</p>
        </div>

        <form className='form-stack form-panel' onSubmit={handleSubmit}>
          {mode === 'signUp' && (
            <Input
              label={translations.auth.username}
              placeholder={translations.form.placeholderUsername}
              value={username}
              error={errors.username}
              onBlur={() => {
                setTouched((current) => ({ ...current, username: true }));
                validateUsername(username);
              }}
              onChange={(event) => {
                setUsername(event.target.value);
                if (touched.username) {
                  validateUsername(event.target.value);
                }
              }}
            />
          )}
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
            {mode === 'signIn'
              ? translations.auth.continue
              : translations.auth.createAccount}
          </Button>
        </form>

        <Button
          type='button'
          variant='ghost'
          onClick={() => {
            setErrors({ username: '', email: '', password: '', form: '' });
            setMode((current) => (current === 'signIn' ? 'signUp' : 'signIn'));
          }}
        >
          {mode === 'signIn'
            ? translations.auth.needAccount
            : translations.auth.haveAccount}
        </Button>

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
