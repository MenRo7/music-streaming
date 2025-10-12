import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DonateModal from '../../components/DonateModal';

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

describe('DonateModal', () => {
  const mockOnClose = jest.fn();
  const mockToUserId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <DonateModal isOpen={false} onClose={mockOnClose} toUserId={mockToUserId} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    expect(screen.getByText('Faire un don')).toBeInTheDocument();
  });

  it('should display default amount', () => {
    render(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('should allow changing the amount', () => {
    render(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '10' } });
    expect(input.value).toBe('10');
  });

  it('should call onClose when cancel button is clicked', () => {
    render(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);
    const cancelButton = screen.getByText('Annuler');

    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show error alert for amount less than 1 euro', async () => {
    window.alert = jest.fn();
    render(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '0.5' } });

    const payButton = screen.getByText('Payer');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Montant minimal: 1€');
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<DonateModal isOpen={true} onClose={mockOnClose} toUserId={mockToUserId} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('step', '0.5');
  });
});
