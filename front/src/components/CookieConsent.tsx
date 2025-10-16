import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/CookieConsent.css';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
}

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const checkConsent = () => {
      const savedConsent = localStorage.getItem('cookieConsent');

      if (!savedConsent) {
        setTimeout(() => {
          setShowBanner(true);
        }, 1000);
      } else {
        try {
          const parsed = JSON.parse(savedConsent);
          setPreferences(parsed);
          setShowBanner(false);
        } catch (e) {
          console.error(t('errors.parseCookieConsent'), e);
          setShowBanner(true);
        }
      }
    };

    checkConsent();


    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookieConsent' || e.key === null) {
        checkConsent();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const prefsWithTimestamp = {
      ...prefs,
      necessary: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(prefsWithTimestamp));
    setPreferences(prefsWithTimestamp);
    setShowBanner(false);
    setShowDetails(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    });
  };

  const acceptNecessaryOnly = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      timestamp: new Date().toISOString(),
    });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-consent-overlay">
      <div className="cookie-consent-banner">
        <div className="cookie-consent-header">
          <h2>🍪 {t('cookies.title')}</h2>
        </div>

        {!showDetails ? (
          <div className="cookie-consent-content">
            <p>
              {t('cookies.description')}
            </p>
            <p className="cookie-consent-privacy-link">
              {t('cookies.moreInfo')}{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                {t('cookies.privacyPolicy')}
              </a>
              .
            </p>

            <div className="cookie-consent-actions">
              <button
                onClick={acceptNecessaryOnly}
                className="cookie-btn cookie-btn-secondary"
              >
                {t('cookies.essentialOnly')}
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="cookie-btn cookie-btn-outline"
              >
                {t('cookies.customize')}
              </button>
              <button onClick={acceptAll} className="cookie-btn cookie-btn-primary">
                {t('cookies.acceptAll')}
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-consent-content">
            <p>
              {t('cookies.chooseCategories')}
            </p>

            <div className="cookie-preferences">
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle" aria-label={t('cookies.essentialRequired')}>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      readOnly
                      aria-label={t('cookies.essentialRequired')}
                    />
                    <span className="cookie-toggle-slider disabled"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h3>{t('cookies.essentialRequired')}</h3>
                    <p className="cookie-category-description">
                      {t('cookies.essentialDescription')}
                    </p>
                    <ul className="cookie-examples">
                      <li><strong>authToken</strong> - {t('cookies.authToken')}</li>
                      <li><strong>XSRF-TOKEN</strong> - {t('cookies.csrfProtection')}</li>
                      <li><strong>laravel_session</strong> - {t('cookies.sessionManagement')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle" aria-label={t('cookies.functional')}>
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                      aria-label={t('cookies.functional')}
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h3>{t('cookies.functional')}</h3>
                    <p className="cookie-category-description">
                      {t('cookies.functionalDescription')}
                    </p>
                    <ul className="cookie-examples">
                      <li><strong>locale</strong> - {t('cookies.languagePreference')}</li>
                      <li><strong>playerState</strong> - {t('cookies.playerState')}</li>
                      <li><strong>cookieConsent</strong> - {t('cookies.cookieChoices')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle" aria-label={t('cookies.analytics')}>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                      aria-label={t('cookies.analytics')}
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h3>{t('cookies.analytics')}</h3>
                    <p className="cookie-category-description">
                      {t('cookies.analyticsDescription')}
                    </p>
                    <ul className="cookie-examples">
                      <li><em>{t('cookies.noAnalytics')}</em></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="cookie-consent-actions">
              <button
                onClick={() => setShowDetails(false)}
                className="cookie-btn cookie-btn-outline"
              >
                {t('cookies.back')}
              </button>
              <button
                onClick={acceptNecessaryOnly}
                className="cookie-btn cookie-btn-secondary"
              >
                {t('cookies.rejectAll')}
              </button>
              <button
                onClick={saveCustomPreferences}
                className="cookie-btn cookie-btn-primary"
              >
                {t('cookies.saveChoices')}
              </button>
            </div>
          </div>
        )}

        <div className="cookie-consent-footer">
          <small>
            {t('cookies.footer')}
          </small>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
