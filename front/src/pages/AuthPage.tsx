import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../contexts/AuthContext';
import { registerUser, verifyEmail, resendEmailCode, resend2fa } from '../apis/AuthService';
import SEOHead from '../components/SEOHead';

import '../styles/AuthPage.css';

const AuthPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(searchParams.get('mode') === 'register');
  const [step, setStep] = useState<'form' | 'verifyEmail' | 'verify2fa'>('form');

  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // 'YYYY-MM-DD'
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, confirm2fa, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/main');
  }, [token, navigate]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 12) {
      return t('auth.passwordTooShort');
    }
    if (!/[a-z]/.test(pwd)) {
      return t('auth.passwordNeedsLowercase');
    }
    if (!/[A-Z]/.test(pwd)) {
      return t('auth.passwordNeedsUppercase');
    }
    if (!/[0-9]/.test(pwd)) {
      return t('auth.passwordNeedsNumber');
    }
    if (!/[@$!%*#?&]/.test(pwd)) {
      return t('auth.passwordNeedsSpecialChar');
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      if (isRegistering) {
        // Validation du mot de passe
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        if (password !== confirmPassword) {
          setError(t('auth.passwordsDoNotMatch'));
          return;
        }

        // Validation de la date de naissance
        if (!dateOfBirth) {
          setError(t('auth.pleaseProvideDob'));
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [y, m, d] = dateOfBirth.split('-').map(Number);
        const dob = new Date(y, (m || 1) - 1, d || 1);
        dob.setHours(0, 0, 0, 0);

        if (dob >= today) {
          setError(t('auth.dobMustBeInPast'));
          return;
        }

        // Vérifier que la date n'est pas trop ancienne (par exemple, plus de 120 ans)
        const maxAge = new Date();
        maxAge.setFullYear(maxAge.getFullYear() - 120);
        if (dob < maxAge) {
          setError(t('auth.dobTooOld'));
          return;
        }

        // Vérifier l'âge minimum (13 ans pour la plupart des services)
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 13);
        if (dob > minAge) {
          setError(t('auth.dobTooYoung'));
          return;
        }

        if (!acceptedTerms || !acceptedPrivacy) {
          setError(t('auth.mustAcceptTermsAndPrivacy'));
          return;
        }

        await registerUser(username.trim(), email.trim(), password, dateOfBirth.trim());
        setInfo(t('auth.verificationCodeSent'));
        setStep('verifyEmail');
        return;
      }

      const status = await login(email.trim(), password);
      if (status === 'verification_required') {
        setInfo(t('auth.emailMustBeVerified'));
        setStep('verifyEmail');
      } else if (status === '2fa_required') {
        setInfo(t('auth.loginCodeSent'));
        setStep('verify2fa');
      }
    } catch (err: any) {
      // Afficher les erreurs du backend si disponibles
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          setError(firstError[0] as string);
        } else {
          setError(t('auth.authenticationError'));
        }
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(t('auth.authenticationError'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      await verifyEmail(email.trim(), code.trim().toUpperCase());
      setInfo(t('auth.emailVerified'));
      setStep('form');
      setIsRegistering(false);
      setCode('');
    } catch {
      setError(t('auth.invalidOrExpiredCode'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      await confirm2fa(email.trim(), code.trim().toUpperCase());
      navigate('/main');
    } catch {
      setError(t('auth.invalidOrExpiredCode'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <SEOHead
        title={isRegistering ? "Créer un Compte | Rhapsody - Streaming Musical" : "Connexion | Rhapsody - Streaming Musical"}
        description={isRegistering ? "Inscrivez-vous gratuitement sur Rhapsody pour commencer à écouter, partager et découvrir de la musique. Créez votre bibliothèque musicale personnelle." : "Connectez-vous à votre compte Rhapsody pour accéder à votre bibliothèque musicale, vos playlists et vos artistes préférés."}
        keywords="inscription rhapsody, créer compte musique, connexion streaming, login musique gratuit"
        type="website"
      />
      <div className="auth-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <Link to="/" style={{ marginRight: '1rem', color: '#d1b3ff', textDecoration: 'none', fontSize: '1.2rem' }}>
            ← {t('auth.backToHome')}
          </Link>
        </div>
        <h2>
          {step === 'verifyEmail'
            ? t('auth.verifyYourEmail')
            : step === 'verify2fa'
            ? t('auth.enterLoginCode')
            : isRegistering
            ? t('auth.createAccount')
            : t('auth.login')}
        </h2>

        {error && <p className="error-message">{error}</p>}
        {info && <p className="info-message">{info}</p>}

        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="input-group">
                <label htmlFor="username">{t('auth.username')}</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">{t('auth.password')}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
              {isRegistering && password && (
                <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                  <div style={{ color: password.length >= 12 ? '#22c55e' : '#f59e0b' }}>
                    {password.length >= 12 ? '✓' : '✗'} {t('auth.passwordTooShort')}
                  </div>
                  <div style={{ color: /[a-z]/.test(password) ? '#22c55e' : '#f59e0b' }}>
                    {/[a-z]/.test(password) ? '✓' : '✗'} {t('auth.passwordNeedsLowercase')}
                  </div>
                  <div style={{ color: /[A-Z]/.test(password) ? '#22c55e' : '#f59e0b' }}>
                    {/[A-Z]/.test(password) ? '✓' : '✗'} {t('auth.passwordNeedsUppercase')}
                  </div>
                  <div style={{ color: /[0-9]/.test(password) ? '#22c55e' : '#f59e0b' }}>
                    {/[0-9]/.test(password) ? '✓' : '✗'} {t('auth.passwordNeedsNumber')}
                  </div>
                  <div style={{ color: /[@$!%*#?&]/.test(password) ? '#22c55e' : '#f59e0b' }}>
                    {/[@$!%*#?&]/.test(password) ? '✓' : '✗'} {t('auth.passwordNeedsSpecialChar')}
                  </div>
                </div>
              )}
            </div>

            {isRegistering && (
              <>
                <div className="input-group">
                  <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="dateOfBirth">{t('auth.dateOfBirth')}</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                  />
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                  />
                  <label htmlFor="acceptTerms">
                    {t('auth.iAcceptThe')} <Link to="/terms" target="_blank">{t('auth.termsOfUse')}</Link>
                  </label>
                </div>

                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="acceptPrivacy"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    required
                  />
                  <label htmlFor="acceptPrivacy">
                    {t('auth.iAcceptThe')} <Link to="/privacy" target="_blank">{t('auth.privacyPolicy')}</Link>
                  </label>
                </div>
              </>
            )}

            <button type="submit" disabled={submitting}>
              {submitting ? t('auth.pleaseWait') : isRegistering ? t('auth.register') : t('auth.login')}
            </button>

            {!isRegistering && (
              <p style={{ marginTop: 12 }}>
                <Link className="toggle-link" to="/forgot">{t('auth.forgotPassword')}</Link>
              </p>
            )}

            <p style={{ marginTop: 12 }}>
              {isRegistering ? (
                <>
                  {t('auth.alreadyHaveAccount')}{' '}
                  <span className="toggle-link" onClick={() => setIsRegistering(false)}>{t('auth.login')}</span>
                </>
              ) : (
                <>
                  {t('auth.dontHaveAccount')}{' '}
                  <span className="toggle-link" onClick={() => setIsRegistering(true)}>{t('auth.register')}</span>
                </>
              )}
            </p>
          </form>
        )}

        {step === 'verifyEmail' && (
          <form onSubmit={handleVerifyEmail}>
            <div className="input-group">
              <label htmlFor="code">{t('auth.codeReceivedByEmail')}</label>
              <input
                type="text"
                id="code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                required
              />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? t('auth.validating') : t('auth.validate')}
            </button>
            <p style={{ marginTop: 12 }}>
              {t('auth.notReceived')}{' '}
              <span
                className="toggle-link"
                role="button"
                tabIndex={0}
                onClick={async () => {
                  if (!email.trim()) { setError(t('auth.provideEmailFirst')); return; }
                  try {
                    await resendEmailCode(email.trim());
                    setInfo(t('auth.newVerificationCodeSent'));
                    setError('');
                  } catch {
                    setError(t('auth.cannotSendNewCode'));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                {t('auth.resendCode')}
              </span>
            </p>
          </form>
        )}

        {step === 'verify2fa' && (
          <form onSubmit={handleVerify2fa}>
            <div className="input-group">
              <label htmlFor="code2fa">{t('auth.loginCode2FA')}</label>
              <input
                type="text"
                id="code2fa"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                required
              />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? t('auth.loggingIn') : t('auth.login')}
            </button>
            <p style={{ marginTop: 12 }}>
              {t('auth.notReceived')}{' '}
              <span
                className="toggle-link"
                role="button"
                tabIndex={0}
                onClick={async () => {
                  if (!email.trim()) { setError(t('auth.provideEmailFirst')); return; }
                  try {
                    await resend2fa(email.trim());
                    setInfo(t('auth.newLoginCodeSent'));
                    setError('');
                  } catch {
                    setError(t('auth.cannotSendNewCode'));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                {t('auth.resendCode')}
              </span>
            </p>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/privacy" className="footer-link">{t('auth.privacyPolicy')}</Link>
          <span className="footer-separator">•</span>
          <Link to="/terms" className="footer-link">{t('auth.termsOfUse')}</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
