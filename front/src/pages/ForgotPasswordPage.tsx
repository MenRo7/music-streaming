// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { forgotPassword, resetPassword } from '../apis/AuthService';
import '../styles/AuthPage.css'; // on réutilise le même style

const ForgotPasswordPage: React.FC = () => {
  type Step = 'request' | 'reset' | 'done';
  const [step, setStep] = useState<Step>('request');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConf, setPasswordConf] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    try {
      await forgotPassword(email);
      setInfo('Si un compte existe pour cet e-mail, un code de réinitialisation a été envoyé.');
      setStep('reset');
    } catch {
      setError("Impossible d'envoyer le code. Vérifiez l'e-mail et réessayez.");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (password !== passwordConf) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await resetPassword(email, code.trim().toUpperCase(), password, passwordConf);
      setInfo('Mot de passe mis à jour. Vous pouvez maintenant vous connecter.');
      setStep('done');
    } catch {
      setError('Code invalide/expiré ou erreur de mise à jour du mot de passe.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>
          {step === 'request' && 'Mot de passe oublié'}
          {step === 'reset' && 'Réinitialiser le mot de passe'}
          {step === 'done' && 'Mot de passe réinitialisé'}
        </h2>

        {error && <p className="error-message">{error}</p>}
        {info && <p className="info-message">{info}</p>}

        {step === 'request' && (
          <form onSubmit={handleRequest}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit">Envoyer le code</button>

            <p style={{ marginTop: 12 }}>
              <Link className="toggle-link" to="/auth">Retour à la connexion</Link>
            </p>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label htmlFor="email2">Email</label>
              <input
                id="email2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="code">Code reçu par e-mail</label>
              <input
                id="code"
                type="text"
                maxLength={6}
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="pwd">Nouveau mot de passe</label>
              <input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="pwd2">Confirmer le mot de passe</label>
              <input
                id="pwd2"
                type="password"
                value={passwordConf}
                onChange={(e) => setPasswordConf(e.target.value)}
                required
              />
            </div>

            <button type="submit">Réinitialiser</button>

            <p style={{ marginTop: 12 }}>
              Pas reçu ?{' '}
              <span
                className="toggle-link"
                role="button"
                onClick={async () => {
                  try {
                    await forgotPassword(email);
                    setInfo('Nouveau code envoyé.');
                    setError('');
                  } catch {
                    setError("Impossible d'envoyer un nouveau code.");
                  }
                }}
              >
                Renvoyer le code
              </span>
            </p>

            <p style={{ marginTop: 12 }}>
              <Link className="toggle-link" to="/auth">Retour à la connexion</Link>
            </p>
          </form>
        )}

        {step === 'done' && (
          <>
            <p className="info-message">Votre mot de passe a été mis à jour.</p>
            <button onClick={() => navigate('/auth')}>Aller à la connexion</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
