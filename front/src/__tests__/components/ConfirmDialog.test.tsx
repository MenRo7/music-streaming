import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dialog with title and message', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmDialog
        isOpen={false}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should render with custom button labels', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Test Title"
        message="Test Message"
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: /yes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /no/i })).toBeInTheDocument();
  });
});
