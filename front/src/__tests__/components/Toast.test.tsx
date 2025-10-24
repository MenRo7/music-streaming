import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Toast from '../../components/Toast';

describe('Toast', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <Toast
        message="Test message"
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should display the correct message', () => {
    render(
      <Toast
        message="Hello World"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should have alert role', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });

  it('should have aria-live attribute', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('should render success type with checkmark icon', () => {
    render(
      <Toast
        message="Success!"
        type="success"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('✓')).toBeInTheDocument();
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('toast--success');
  });

  it('should render error type with X icon', () => {
    render(
      <Toast
        message="Error!"
        type="error"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('✕')).toBeInTheDocument();
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('toast--error');
  });

  it('should render warning type with warning icon', () => {
    render(
      <Toast
        message="Warning!"
        type="warning"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('⚠')).toBeInTheDocument();
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('toast--warning');
  });

  it('should render info type with info icon', () => {
    render(
      <Toast
        message="Info"
        type="info"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('ℹ')).toBeInTheDocument();
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('toast--info');
  });

  it('should render close button', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after default duration', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(4000);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should auto-close after custom duration', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
        duration={2000}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2000);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not auto-close when duration is 0', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
        duration={0}
      />
    );

    jest.advanceTimersByTime(10000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should render with default info type', () => {
    render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('toast--info');
  });

  it('should clear timeout on unmount', () => {
    const { unmount } = render(
      <Toast
        message="Test message"
        isOpen={true}
        onClose={mockOnClose}
        duration={5000}
      />
    );

    unmount();
    jest.advanceTimersByTime(5000);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
