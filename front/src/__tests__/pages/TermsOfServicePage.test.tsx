import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TermsOfServicePage from '../../pages/TermsOfServicePage';

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <TermsOfServicePage />
    </BrowserRouter>
  );
};

describe('TermsOfServicePage', () => {
  it('should render terms of service page', () => {
    renderComponent();
    expect(screen.getByText(/Conditions Générales d'Utilisation/i)).toBeInTheDocument();
  });

  it('should have legal-page class', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.legal-page')).toBeInTheDocument();
  });

  it('should have link to auth page', () => {
    renderComponent();
    const authLink = screen.getByText(/Retour à l'authentification/i);
    expect(authLink).toBeInTheDocument();
  });

  it('should have link to privacy page', () => {
    renderComponent();
    const privacyLink = screen.getByText(/Politique de Confidentialité/i);
    expect(privacyLink).toBeInTheDocument();
  });
});
