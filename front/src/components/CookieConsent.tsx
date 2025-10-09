import React, { useState, useEffect } from 'react';
import '../styles/CookieConsent.css';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  timestamp: string;
}

const CookieConsent: React.FC = () => {
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
          console.error('Failed to parse cookie consent', e);
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
          <h2>🍪 Gestion des Cookies</h2>
        </div>

        {!showDetails ? (
          <div className="cookie-consent-content">
            <p>
              Nous utilisons des cookies pour améliorer votre expérience. Les cookies essentiels sont
              nécessaires au fonctionnement du site (authentification, session). Les autres cookies
              sont optionnels.
            </p>
            <p className="cookie-consent-privacy-link">
              Pour plus d'informations, consultez notre{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Politique de Confidentialité
              </a>
              .
            </p>

            <div className="cookie-consent-actions">
              <button
                onClick={acceptNecessaryOnly}
                className="cookie-btn cookie-btn-secondary"
              >
                Cookies essentiels uniquement
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="cookie-btn cookie-btn-outline"
              >
                Personnaliser
              </button>
              <button onClick={acceptAll} className="cookie-btn cookie-btn-primary">
                Tout accepter
              </button>
            </div>
          </div>
        ) : (
          <div className="cookie-consent-content">
            <p>
              Choisissez les catégories de cookies que vous souhaitez autoriser. Les cookies
              essentiels ne peuvent pas être désactivés car ils sont nécessaires au fonctionnement
              du site.
            </p>

            <div className="cookie-preferences">
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                      readOnly
                    />
                    <span className="cookie-toggle-slider disabled"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h3>Cookies Essentiels (Obligatoires)</h3>
                    <p className="cookie-category-description">
                      Nécessaires au fonctionnement du site. Ils permettent l'authentification, la
                      gestion de session, et la sécurité (protection CSRF).
                    </p>
                    <ul className="cookie-examples">
                      <li><strong>authToken</strong> - Token d'authentification (localStorage)</li>
                      <li><strong>XSRF-TOKEN</strong> - Protection contre les attaques CSRF</li>
                      <li><strong>laravel_session</strong> - Gestion de session (120 min)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) =>
                        setPreferences({ ...preferences, functional: e.target.checked })
                      }
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h3>Cookies Fonctionnels</h3>
                    <p className="cookie-category-description">
                      Améliorent votre expérience en mémorisant vos préférences (langue, thème, etc.).
                    </p>
                    <ul className="cookie-examples">
                      <li><strong>locale</strong> - Préférence de langue</li>
                      <li><strong>playerState</strong> - État du lecteur audio</li>
                      <li><strong>cookieConsent</strong> - Vos choix de cookies</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({ ...preferences, analytics: e.target.checked })
                      }
                    />
                    <span className="cookie-toggle-slider"></span>
                  </label>
                  <div className="cookie-category-info">
                    <h3>Cookies Analytiques</h3>
                    <p className="cookie-category-description">
                      Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                      Actuellement non utilisés.
                    </p>
                    <ul className="cookie-examples">
                      <li><em>Aucun cookie analytique actuellement utilisé</em></li>
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
                Retour
              </button>
              <button
                onClick={acceptNecessaryOnly}
                className="cookie-btn cookie-btn-secondary"
              >
                Refuser tout (sauf essentiels)
              </button>
              <button
                onClick={saveCustomPreferences}
                className="cookie-btn cookie-btn-primary"
              >
                Enregistrer mes choix
              </button>
            </div>
          </div>
        )}

        <div className="cookie-consent-footer">
          <small>
            Conformément au RGPD et à la directive ePrivacy. Vous pouvez modifier vos préférences à
            tout moment dans les paramètres.
          </small>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
