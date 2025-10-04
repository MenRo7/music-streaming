import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { AuthContext } from '../apis/AuthContext';
import { registerUser, verifyEmail, resendEmailCode, resend2fa } from '../apis/AuthService';

import '../styles/AuthPage.css';

const AuthPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'form' | 'verifyEmail' | 'verify2fa'>('form');

  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // 'YYYY-MM-DD'

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, confirm2fa, token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/main');
  }, [token, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    setInfo('');
    setSubmitting(true);

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas.');
          return;
        }

        if (dateOfBirth) {
          const today = new Date();
          const [y, m, d] = dateOfBirth.split('-').map(Number);
          const dob = new Date(y, (m || 1) - 1, d || 1);
          const eighteen = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          if (dob > eighteen) {
            setError('Vous devez avoir au moins 18 ans pour créer un compte.');
            return;
          }
        } else {
          setError('Veuillez renseigner votre date de naissance.');
          return;
        }

        await registerUser(username.trim(), email.trim(), password, dateOfBirth.trim());
        setInfo('Un code de vérification vous a été envoyé par e-mail.');
        setStep('verifyEmail');
        return;
      }

      const status = await login(email.trim(), password);
      if (status === 'verification_required') {
        setInfo("Votre e-mail doit être vérifié. Un code vous a été envoyé.");
        setStep('verifyEmail');
      } else if (status === '2fa_required') {
        setInfo('Un code de connexion vous a été envoyé par e-mail.');
        setStep('verify2fa');
      }
    } catch {
      setError("Erreur lors de l'authentification. Vérifiez vos informations.");
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
      setInfo('E-mail vérifié ! Vous pouvez maintenant vous connecter.');
      setStep('form');
      setIsRegistering(false);
      setCode('');
    } catch {
      setError('Code invalide ou expiré.');
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
      setError('Code invalide ou expiré.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>
          {step === 'verifyEmail'
            ? 'Vérifier votre e-mail'
            : step === 'verify2fa'
            ? 'Entrer le code de connexion'
            : isRegistering
            ? 'Créer un compte'
            : 'Se connecter'}
        </h2>

        {error && <p className="error-message">{error}</p>}
        {info && <p className="info-message">{info}</p>}

        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="input-group">
                <label htmlFor="username">Nom d&apos;utilisateur</label>
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
              <label htmlFor="email">Email</label>
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
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
              />
            </div>

            {isRegistering && (
              <>
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
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
                  <label htmlFor="dateOfBirth">Date de naissance</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    autoComplete="bday"
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={submitting}>
              {submitting ? 'Veuillez patienter…' : isRegistering ? "S'inscrire" : 'Se connecter'}
            </button>

            {!isRegistering && (
              <p style={{ marginTop: 12 }}>
                <Link className="toggle-link" to="/forgot">Mot de passe oublié ?</Link>
              </p>
            )}

            <p style={{ marginTop: 12 }}>
              {isRegistering ? (
                <>
                  Vous avez déjà un compte ?{' '}
                  <span className="toggle-link" onClick={() => setIsRegistering(false)}>Se connecter</span>
                </>
              ) : (
                <>
                  Vous n&apos;avez pas de compte ?{' '}
                  <span className="toggle-link" onClick={() => setIsRegistering(true)}>S&apos;inscrire</span>
                </>
              )}
            </p>
          </form>
        )}

        {step === 'verifyEmail' && (
          <form onSubmit={handleVerifyEmail}>
            <div className="input-group">
              <label htmlFor="code">Code reçu par e-mail</label>
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
              {submitting ? 'Validation…' : 'Valider'}
            </button>
            <p style={{ marginTop: 12 }}>
              Pas reçu ?{' '}
              <span
                className="toggle-link"
                role="button"
                onClick={async () => {
                  if (!email.trim()) { setError("Renseignez d'abord votre e-mail."); return; }
                  try {
                    await resendEmailCode(email.trim());
                    setInfo('Nouveau code de vérification envoyé.');
                    setError('');
                  } catch {
                    setError("Impossible d'envoyer un nouveau code.");
                  }
                }}
              >
                Renvoyer le code
              </span>
            </p>
          </form>
        )}

        {step === 'verify2fa' && (
          <form onSubmit={handleVerify2fa}>
            <div className="input-group">
              <label htmlFor="code2fa">Code de connexion (2FA)</label>
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
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
            <p style={{ marginTop: 12 }}>
              Pas reçu ?{' '}
              <span
                className="toggle-link"
                role="button"
                onClick={async () => {
                  if (!email.trim()) { setError("Renseignez d'abord votre e-mail."); return; }
                  try {
                    await resend2fa(email.trim());
                    setInfo('Nouveau code de connexion envoyé.');
                    setError('');
                  } catch {
                    setError("Impossible d'envoyer un nouveau code.");
                  }
                }}
              >
                Renvoyer le code
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
