import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrivacyPolicyPage from '../../pages/PrivacyPolicyPage';

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <PrivacyPolicyPage />
    </BrowserRouter>
  );
};

describe('PrivacyPolicyPage', () => {
  it('should render privacy policy page', () => {
    renderComponent();
    expect(screen.getByText(/Politique de Confidentialité/i)).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    renderComponent();
    expect(screen.getByText(/Dernière mise à jour/i)).toBeInTheDocument();
  });

  it('should display company name', () => {
    renderComponent();
    expect(screen.getByText(/Rhapsody/i)).toBeInTheDocument();
  });

  it('should display contact email', () => {
    renderComponent();
    expect(screen.getByText(/privacy@rhapsody.com/i)).toBeInTheDocument();
  });

  it('should have link to preferences page', () => {
    renderComponent();
    const preferencesLinks = screen.getAllByText(/Préférences/i);
    expect(preferencesLinks.length).toBeGreaterThan(0);
  });

  it('should have link to auth page', () => {
    renderComponent();
    const authLink = screen.getByText(/Retour à l'authentification/i);
    expect(authLink).toBeInTheDocument();
    expect(authLink.closest('a')).toHaveAttribute('href', '/auth');
  });

  it('should have link to terms page', () => {
    renderComponent();
    const termsLink = screen.getByText(/Conditions Générales d'Utilisation/i);
    expect(termsLink).toBeInTheDocument();
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
  });

  it('should display GDPR rights sections', () => {
    renderComponent();
    expect(screen.getByText(/Droit d'accès/i)).toBeInTheDocument();
    expect(screen.getByText(/Droit de rectification/i)).toBeInTheDocument();
    expect(screen.getByText(/Droit à l'effacement/i)).toBeInTheDocument();
    expect(screen.getByText(/Droit à la portabilité/i)).toBeInTheDocument();
  });

  it('should display data collection section', () => {
    renderComponent();
    expect(screen.getByText(/Données Collectées/i)).toBeInTheDocument();
  });

  it('should display security section', () => {
    renderComponent();
    expect(screen.getByText(/Sécurité des Données/i)).toBeInTheDocument();
  });

  it('should display cookies section', () => {
    renderComponent();
    expect(screen.getByText(/Cookies et Technologies Similaires/i)).toBeInTheDocument();
  });

  it('should have legal-page class', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.legal-page')).toBeInTheDocument();
  });

  it('should display Stripe information', () => {
    renderComponent();
    expect(screen.getByText(/Stripe/i)).toBeInTheDocument();
  });

  it('should display CNIL contact information', () => {
    renderComponent();
    expect(screen.getByText(/CNIL/i)).toBeInTheDocument();
  });

  it('should display minors section', () => {
    renderComponent();
    expect(screen.getByText(/Mineurs/i)).toBeInTheDocument();
  });
});
