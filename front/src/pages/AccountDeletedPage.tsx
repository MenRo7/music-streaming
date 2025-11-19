import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ENV from '../config/env';
import SEOHead from '../components/SEOHead';
import '../styles/AuthPage.css';

const AccountDeletedPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const confirmDeletion = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage(t('accountDeleted.invalidToken'));
        return;
      }

      try {
        const API_BASE_URL = ENV.API_URL.replace('/api', '');
        const response = await fetch(`${API_BASE_URL}/api/account/delete/confirm/${token}`, {
          method: 'GET',
        });

        if (response.ok) {
          setStatus('success');
          // Clear any local storage
          localStorage.clear();
        } else {
          const data = await response.json();
          setStatus('error');
          setErrorMessage(data.message || t('accountDeleted.errorConfirming'));
        }
      } catch (error) {
        console.error('Error confirming account deletion:', error);
        setStatus('error');
        setErrorMessage(t('accountDeleted.errorConfirming'));
      }
    };

    confirmDeletion();
  }, [token, t]);

  return (
    <div className="auth-page">
      <SEOHead
        title="Compte Supprimé | Rhapsody - Streaming Musical"
        description="Confirmation de suppression de compte Rhapsody"
        keywords="suppression compte, confirmation"
        type="website"
      />
      <div className="auth-container">
        {status === 'loading' && (
          <>
            <h2>{t('accountDeleted.processingTitle')}</h2>
            <p className="info-message">{t('accountDeleted.processingMessage')}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2>{t('accountDeleted.successTitle')}</h2>
            <p className="info-message">{t('accountDeleted.successMessage')}</p>
            <button
              onClick={() => navigate('/')}
              style={{ marginTop: '20px' }}
            >
              {t('accountDeleted.backToHome')}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2>{t('accountDeleted.errorTitle')}</h2>
            <p className="error-message">{errorMessage}</p>
            <button
              onClick={() => navigate('/')}
              style={{ marginTop: '20px' }}
            >
              {t('accountDeleted.backToHome')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountDeletedPage;
