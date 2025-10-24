import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DonateModal from '../../components/DonateModal';
import { DialogProvider } from '../../contexts/DialogContext';

// Mock the DonateService
jest.mock('../../apis/DonateService', () => ({
  createDonationCheckoutSession: jest.fn(),
}));

// Mock ENV config
jest.mock('../../config/env', () => ({
  default: {
    STRIPE_PUBLISHABLE_KEY: 'pk_test_mock_key',
    API_URL: 'http://localhost:8000/api',
  },
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <DialogProvider>
      {ui}
    </DialogProvider>
  );
};

describe('DonateModal', () => {
  const mockOnClose = jest.fn();
  const mockToUserId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = renderWithProviders(
      <DonateModal isOpen={false} onClose={mockOnClose} toUserId={mockToUserId} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    expect(screen.getByText('Faire un don')).toBeInTheDocument();
  });

  it('should display default amount', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('should allow changing the amount', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '10' } });
    expect(input.value).toBe('10');
  });

  it('should call onClose when cancel button is clicked', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    const cancelButton = screen.getByText('Annuler');

    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show toast for amount less than 1 euro', async () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '0.5' } });

    const payButton = screen.getByText('Payer');
    fireEvent.click(payButton);

    // Should show toast with min amount message
    await waitFor(() => {
      expect(screen.queryByText(/montant minimal/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should have proper accessibility attributes', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('step', '0.5');
  });

  it('should render modal title', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    expect(screen.getByText(/faire un don/i)).toBeInTheDocument();
  });

  it('should render pay button', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    expect(screen.getByText(/payer/i)).toBeInTheDocument();
  });

  it('should handle valid amount input', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '15.50' } });
    expect(input.value).toBe('15.50');
  });

  it('should render cancel and pay buttons', () => {
    renderWithProviders(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);

    expect(screen.getByText(/annuler/i)).toBeInTheDocument();
    expect(screen.getByText(/payer/i)).toBeInTheDocument();
  });
});
