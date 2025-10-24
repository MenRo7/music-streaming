import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CookieConsent from '../../components/CookieConsent';

describe('CookieConsent', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should render cookie consent banner when not accepted', () => {
    render(<CookieConsent />);

    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
  });

  it('should not render when consent is already given', () => {
    localStorage.setItem('cookieConsent', 'true');

    const { container } = render(<CookieConsent />);

    expect(container.firstChild).toBeNull();
  });

  it('should accept all cookies when clicking accept all button', () => {
    render(<CookieConsent />);

    const acceptButton = screen.getByRole('button', { name: /accepter/i });
    fireEvent.click(acceptButton);

    expect(localStorage.getItem('cookieConsent')).toBe('true');
  });

  it('should save preferences when clicking save button', () => {
    render(<CookieConsent />);

    // Open preferences
    const settingsButton = screen.getByRole('button', { name: /param/i });
    fireEvent.click(settingsButton);

    // Save preferences
    const saveButton = screen.getByRole('button', { name: /enregistrer/i });
    fireEvent.click(saveButton);

    expect(localStorage.getItem('cookieConsent')).toBe('true');
  });

  it('should toggle cookie preferences', () => {
    render(<CookieConsent />);

    // Open preferences
    const settingsButton = screen.getByRole('button', { name: /param/i });
    fireEvent.click(settingsButton);

    // Find checkboxes (if any)
    const checkboxes = screen.queryAllByRole('checkbox');
    if (checkboxes.length > 0) {
      fireEvent.click(checkboxes[0]);
    }

    // Verify preferences panel is open
    expect(screen.getByRole('button', { name: /enregistrer/i })).toBeInTheDocument();
  });

  it('should refuse all non-essential cookies', () => {
    render(<CookieConsent />);

    // Open preferences
    const settingsButton = screen.getByRole('button', { name: /param/i });
    fireEvent.click(settingsButton);

    // Refuse all
    const refuseButton = screen.getByRole('button', { name: /refuser/i });
    fireEvent.click(refuseButton);

    expect(localStorage.getItem('cookieConsent')).toBe('true');
  });
});
