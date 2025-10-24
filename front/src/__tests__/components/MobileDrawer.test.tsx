import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileDrawer from '../../components/MobileDrawer';

describe('MobileDrawer', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = '';
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <MobileDrawer isOpen={false} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test Drawer">
        <div>Drawer Content</div>
      </MobileDrawer>
    );

    expect(screen.getByText('Test Drawer')).toBeInTheDocument();
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('should render backdrop', () => {
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const backdrop = container.querySelector('.mobile-drawer-backdrop');
    expect(backdrop).toBeInTheDocument();
  });

  it('should render title in header', () => {
    render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="My Drawer">
        <div>Content</div>
      </MobileDrawer>
    );

    expect(screen.getByRole('heading', { name: 'My Drawer' })).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const closeButton = screen.getByLabelText('Close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', () => {
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const backdrop = container.querySelector('.mobile-drawer-backdrop');
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Escape key is pressed', () => {
    render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Enter is pressed on backdrop', () => {
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const backdrop = container.querySelector('.mobile-drawer-backdrop');
    fireEvent.keyDown(backdrop!, { key: 'Enter' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Space is pressed on backdrop', () => {
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const backdrop = container.querySelector('.mobile-drawer-backdrop');
    fireEvent.keyDown(backdrop!, { key: ' ' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render on right side by default', () => {
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const drawer = container.querySelector('.mobile-drawer-right');
    expect(drawer).toBeInTheDocument();
  });

  it('should render on left side when specified', () => {
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test" side="left">
        <div>Content</div>
      </MobileDrawer>
    );

    const drawer = container.querySelector('.mobile-drawer-left');
    expect(drawer).toBeInTheDocument();
  });

  it('should prevent body scroll when open', () => {
    render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when closed', () => {
    const { rerender } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <MobileDrawer isOpen={false} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    expect(document.body.style.overflow).toBe('');
  });

  it('should render children content', () => {
    render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div data-testid="custom-content">Custom Content</div>
      </MobileDrawer>
    );

    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('should have accessible backdrop', () => {
    const { container } = render(
      <MobileDrawer isOpen={true} onClose={mockOnClose} title="Test">
        <div>Content</div>
      </MobileDrawer>
    );

    const backdrop = container.querySelector('.mobile-drawer-backdrop');
    expect(backdrop).toHaveAttribute('role', 'button');
    expect(backdrop).toHaveAttribute('aria-label', 'Close drawer');
    expect(backdrop).toHaveAttribute('tabIndex', '0');
  });
});
