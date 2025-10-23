import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileCircleCard from '../../components/ProfileCircleCard';

describe('ProfileCircleCard', () => {
  it('renders profile name', () => {
    render(<ProfileCircleCard name="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders profile image when provided', () => {
    render(<ProfileCircleCard name="John Doe" image="/avatar.jpg" />);

    const img = screen.getByAltText('John Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/avatar.jpg');
    expect(img).toHaveClass('profile-circle-img');
  });

  it('renders placeholder with first letter when no image', () => {
    render(<ProfileCircleCard name="John Doe" />);

    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('J')).toHaveClass('profile-circle-placeholder');
  });

  it('renders uppercase first letter in placeholder', () => {
    render(<ProfileCircleCard name="alice" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders U for empty name', () => {
    render(<ProfileCircleCard name="" />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<ProfileCircleCard name="John Doe" onClick={handleClick} />);

    const card = screen.getByText('John Doe').parentElement;
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies role="button" when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<ProfileCircleCard name="John Doe" onClick={handleClick} />);

    const card = screen.getByText('John Doe').parentElement;
    expect(card).toHaveAttribute('role', 'button');
  });

  it('does not apply role when onClick is not provided', () => {
    render(<ProfileCircleCard name="John Doe" />);

    const card = screen.getByText('John Doe').parentElement;
    expect(card).not.toHaveAttribute('role');
  });

  it('sets tabIndex to 0 when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<ProfileCircleCard name="John Doe" onClick={handleClick} />);

    const card = screen.getByText('John Doe').parentElement;
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('sets tabIndex to -1 when onClick is not provided', () => {
    render(<ProfileCircleCard name="John Doe" />);

    const card = screen.getByText('John Doe').parentElement;
    expect(card).toHaveAttribute('tabIndex', '-1');
  });

  it('applies profile-circle-card className', () => {
    const { container } = render(<ProfileCircleCard name="John Doe" />);
    expect(container.querySelector('.profile-circle-card')).toBeInTheDocument();
  });

  it('applies title attribute to name element', () => {
    render(<ProfileCircleCard name="John Doe" />);

    const nameElement = screen.getByText('John Doe');
    expect(nameElement).toHaveAttribute('title', 'John Doe');
  });

  it('applies profile-circle-name className to name', () => {
    render(<ProfileCircleCard name="John Doe" />);

    const nameElement = screen.getByText('John Doe');
    expect(nameElement).toHaveClass('profile-circle-name');
  });

  it('handles names with special characters', () => {
    render(<ProfileCircleCard name="François José" />);

    expect(screen.getByText('François José')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('handles single character names', () => {
    render(<ProfileCircleCard name="X" />);

    expect(screen.getByText('X')).toBeInTheDocument();
  });

  it('handles very long names', () => {
    const longName = 'This Is A Very Long Name That Might Overflow';
    render(<ProfileCircleCard name={longName} />);

    expect(screen.getByText(longName)).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('handles names with numbers', () => {
    render(<ProfileCircleCard name="User123" />);

    expect(screen.getByText('User123')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('handles names starting with lowercase', () => {
    render(<ProfileCircleCard name="john" />);

    expect(screen.getByText('john')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // Should be uppercase
  });

  it('does not call onClick when card is clicked without handler', () => {
    render(<ProfileCircleCard name="John Doe" />);

    const card = screen.getByText('John Doe').parentElement;
    expect(() => fireEvent.click(card!)).not.toThrow();
  });

  it('handles image with query parameters', () => {
    render(<ProfileCircleCard name="John Doe" image="/avatar.jpg?size=100" />);

    const img = screen.getByAltText('John Doe');
    expect(img).toHaveAttribute('src', '/avatar.jpg?size=100');
  });

  it('handles null name gracefully', () => {
    render(<ProfileCircleCard name={null as any} />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('handles undefined name gracefully', () => {
    render(<ProfileCircleCard name={undefined as any} />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });
});
