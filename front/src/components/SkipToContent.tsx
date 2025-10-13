import React from 'react';
import '../styles/SkipToContent.css';

/**
 * Skip to Content link for keyboard accessibility
 * Allows keyboard users to bypass navigation and jump directly to main content
 *
 * This is a WCAG 2.1 Level A requirement (2.4.1 Bypass Blocks)
 */
const SkipToContent: React.FC = () => {
  return (
    <a href="#main-content" className="skip-to-content">
      Skip to main content
    </a>
  );
};

export default SkipToContent;
