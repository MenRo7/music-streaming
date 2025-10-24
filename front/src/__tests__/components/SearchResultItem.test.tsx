import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchResultItem from '../../components/SearchResultItem';

describe('SearchResultItem', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with label', () => {
    render(
      <SearchResultItem
        image={null}
        label="Test Item"
      />
    );

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('should render with image', () => {
    render(
      <SearchResultItem
        image="test-image.jpg"
        label="Test Item"
      />
    );

    const image = screen.getByAltText('Test Item');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });

  it('should render rounded image when isRounded is true', () => {
    render(
      <SearchResultItem
        image="test-image.jpg"
        label="Test Item"
        isRounded={true}
      />
    );

    const image = screen.getByAltText('Test Item');
    expect(image).toHaveClass('rounded');
  });

  it('should not render rounded image when isRounded is false', () => {
    render(
      <SearchResultItem
        image="test-image.jpg"
        label="Test Item"
        isRounded={false}
      />
    );

    const image = screen.getByAltText('Test Item');
    expect(image).not.toHaveClass('rounded');
  });

  it('should call onClick when clicked', () => {
    render(
      <SearchResultItem
        image="test-image.jpg"
        label="Test Item"
        onClick={mockOnClick}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should render children content', () => {
    render(
      <SearchResultItem
        image={null}
        label="Test Item"
      >
        <span>Extra Content</span>
      </SearchResultItem>
    );

    expect(screen.getByText('Extra Content')).toBeInTheDocument();
  });

  it('should not render image when image is null', () => {
    render(
      <SearchResultItem
        image={null}
        label="Test Item"
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('should render as list item', () => {
    const { container } = render(
      <SearchResultItem
        image={null}
        label="Test Item"
      />
    );

    const listItem = container.querySelector('li.search-result-item');
    expect(listItem).toBeInTheDocument();
  });

  it('should render button with correct type', () => {
    render(
      <SearchResultItem
        image={null}
        label="Test Item"
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should apply default image when image is provided', () => {
    render(
      <SearchResultItem
        image="test-image.jpg"
        label="Test Item"
      />
    );

    const image = screen.getByAltText('Test Item');
    expect(image).toHaveAttribute('src', 'test-image.jpg');
  });

  it('should render label in span element', () => {
    render(
      <SearchResultItem
        image={null}
        label="Test Item"
      />
    );

    const label = screen.getByText('Test Item');
    expect(label).toHaveClass('search-result-item-label');
  });
});
