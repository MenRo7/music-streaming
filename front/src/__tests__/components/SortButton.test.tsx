import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SortButton from '../../components/SortButton';

describe('SortButton', () => {
  const mockOnSortChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sort button', () => {
    render(
      <SortButton
        currentSort="title"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should have sort-button class', () => {
    render(
      <SortButton
        currentSort="title"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('sort-button');
  });

  it('should render sort icon', () => {
    const { container } = render(
      <SortButton
        currentSort="title"
        onSortChange={mockOnSortChange}
      />
    );

    const icon = container.querySelector('.control-icon');
    expect(icon).toBeInTheDocument();
  });

  it('should open dropdown menu when clicked', () => {
    render(
      <SortButton
        currentSort="title"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Dropdown should be visible
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('should show sort options in dropdown', () => {
    render(
      <SortButton
        currentSort="title"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText(/sort\.byTitle/)).toBeInTheDocument();
    expect(screen.getByText(/sort\.byArtist/)).toBeInTheDocument();
    expect(screen.getByText(/sort\.byDateAdded/)).toBeInTheDocument();
  });

  it('should mark current sort option with checkmark', () => {
    render(
      <SortButton
        currentSort="title"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const titleOption = screen.getByText(/sort\.byTitle.*✓/);
    expect(titleOption).toBeInTheDocument();
  });

  it('should call onSortChange when option is selected', () => {
    render(
      <SortButton
        currentSort="title"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const artistOption = screen.getByText(/sort\.byArtist/);
    fireEvent.click(artistOption);

    expect(mockOnSortChange).toHaveBeenCalledWith('artist');
  });

  it('should display different current sort', () => {
    render(
      <SortButton
        currentSort="artist"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const artistOption = screen.getByText(/sort\.byArtist.*✓/);
    expect(artistOption).toBeInTheDocument();
  });

  it('should handle date_added sort option', () => {
    render(
      <SortButton
        currentSort="date_added"
        onSortChange={mockOnSortChange}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const dateOption = screen.getByText(/sort\.byDateAdded.*✓/);
    expect(dateOption).toBeInTheDocument();
  });
});
