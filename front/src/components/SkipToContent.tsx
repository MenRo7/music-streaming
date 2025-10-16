import React from 'react';
import { useTranslation } from 'react-i18next';
import '../styles/SkipToContent.css';

/**
 * Skip to Content link for keyboard accessibility
 * Allows keyboard users to bypass navigation and jump directly to main content
 *
 * This is a WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks)
 */
const SkipToContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <a href="#main-content" className="skip-to-content">
      {t('skipToContent.label')}
    </a>
  );
};

export default SkipToContent;
