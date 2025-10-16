// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { forgotPassword, resetPassword } from '../apis/AuthService';
import '../styles/AuthPage.css';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
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
      setInfo(t('forgotPassword.codeSentInfo'));
      setStep('reset');
    } catch {
      setError(t('forgotPassword.errorSendingCode'));
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (password !== passwordConf) {
      setError(t('forgotPassword.passwordMismatch'));
      return;
    }
    try {
      await resetPassword(email, code.trim().toUpperCase(), password, passwordConf);
      setInfo(t('forgotPassword.successMessage'));
      setStep('done');
    } catch {
      setError(t('forgotPassword.invalidCode'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>
          {step === 'request' && t('forgotPassword.titleRequest')}
          {step === 'reset' && t('forgotPassword.titleReset')}
          {step === 'done' && t('forgotPassword.titleDone')}
        </h2>

        {error && <p className="error-message">{error}</p>}
        {info && <p className="info-message">{info}</p>}

        {step === 'request' && (
          <form onSubmit={handleRequest}>
            <div className="input-group">
              <label htmlFor="email">{t('forgotPassword.emailLabel')}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit">{t('forgotPassword.sendCodeButton')}</button>

            <p style={{ marginTop: 12 }}>
              <Link className="toggle-link" to="/auth">{t('forgotPassword.backToLogin')}</Link>
            </p>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label htmlFor="email2">{t('forgotPassword.emailLabel')}</label>
              <input
                id="email2"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="code">{t('forgotPassword.codeLabel')}</label>
              <input
                id="code"
                type="text"
                maxLength={6}
                placeholder={t('forgotPassword.codePlaceholder')}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="pwd">{t('forgotPassword.newPasswordLabel')}</label>
              <input
                id="pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="pwd2">{t('forgotPassword.confirmPasswordLabel')}</label>
              <input
                id="pwd2"
                type="password"
                value={passwordConf}
                onChange={(e) => setPasswordConf(e.target.value)}
                required
              />
            </div>

            <button type="submit">{t('forgotPassword.resetButton')}</button>

            <p style={{ marginTop: 12 }}>
              {t('forgotPassword.notReceived')}{' '}
              <span
                className="toggle-link"
                role="button"
                tabIndex={0}
                onClick={async () => {
                  try {
                    await forgotPassword(email);
                    setInfo(t('forgotPassword.resendSuccess'));
                    setError('');
                  } catch {
                    setError(t('forgotPassword.resendError'));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.currentTarget.click();
                  }
                }}
              >
                {t('forgotPassword.resendCode')}
              </span>
            </p>

            <p style={{ marginTop: 12 }}>
              <Link className="toggle-link" to="/auth">{t('forgotPassword.backToLogin')}</Link>
            </p>
          </form>
        )}

        {step === 'done' && (
          <>
            <p className="info-message">{t('forgotPassword.passwordUpdated')}</p>
            <button onClick={() => navigate('/auth')}>{t('forgotPassword.goToLogin')}</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
