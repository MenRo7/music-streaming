import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMusic,
  faHeart,
  faListUl,
  faUsers,
  faCloudUploadAlt,
  faShieldAlt,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const features = [
    {
      icon: faMusic,
      titleKey: 'landing.features.streaming.title',
      descKey: 'landing.features.streaming.description',
    },
    {
      icon: faListUl,
      titleKey: 'landing.features.playlists.title',
      descKey: 'landing.features.playlists.description',
    },
    {
      icon: faCloudUploadAlt,
      titleKey: 'landing.features.upload.title',
      descKey: 'landing.features.upload.description',
    },
    {
      icon: faHeart,
      titleKey: 'landing.features.favorites.title',
      descKey: 'landing.features.favorites.description',
    },
    {
      icon: faUsers,
      titleKey: 'landing.features.social.title',
      descKey: 'landing.features.social.description',
    },
    {
      icon: faShieldAlt,
      titleKey: 'landing.features.privacy.title',
      descKey: 'landing.features.privacy.description',
    },
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-logo">
            <FontAwesomeIcon icon={faMusic} />
            <span>Rhapsody</span>
          </div>
          <nav className="landing-nav">
            <div className="language-switcher">
              <button
                onClick={() => changeLanguage('fr')}
                className={i18n.language === 'fr' ? 'active' : ''}
                aria-label="Français"
              >
                🇫🇷
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={i18n.language === 'en' ? 'active' : ''}
                aria-label="English"
              >
                🇬🇧
              </button>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/auth')}>
              {t('landing.header.login')}
            </button>
            <button className="btn-primary" onClick={() => navigate('/auth')}>
              {t('landing.header.signup')}
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-title">{t('landing.hero.title')}</h1>
            <p className="hero-subtitle">{t('landing.hero.subtitle')}</p>
            <div className="hero-cta">
              <button className="btn-cta-primary" onClick={() => navigate('/auth')}>
                {t('landing.hero.ctaPrimary')}
              </button>
              <button className="btn-cta-secondary" onClick={() => navigate('/auth')}>
                {t('landing.hero.ctaSecondary')}
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-placeholder">
              <FontAwesomeIcon icon={faMusic} size="10x" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="landing-container">
          <h2 className="section-title">{t('landing.features.title')}</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <FontAwesomeIcon icon={feature.icon} size="3x" />
                </div>
                <h3 className="feature-title">{t(feature.titleKey)}</h3>
                <p className="feature-description">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="landing-container">
          <h2 className="cta-title">{t('landing.cta.title')}</h2>
          <p className="cta-subtitle">{t('landing.cta.subtitle')}</p>
          <button className="btn-cta-large" onClick={() => navigate('/auth')}>
            {t('landing.cta.button')}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Rhapsody</h4>
              <p>{t('landing.footer.tagline')}</p>
            </div>
            <div className="footer-section">
              <h4>{t('landing.footer.legal')}</h4>
              <ul>
                <li>
                  <button onClick={() => navigate('/privacy')}>{t('landing.footer.privacy')}</button>
                </li>
                <li>
                  <button onClick={() => navigate('/terms')}>{t('landing.footer.terms')}</button>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
