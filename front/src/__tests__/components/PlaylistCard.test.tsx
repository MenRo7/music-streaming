import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PlaylistCard from '../../components/PlaylistCard';

describe('PlaylistCard', () => {
  it('renders playlist title', () => {
    render(<PlaylistCard title="My Playlist" />);
    expect(screen.getByText('My Playlist')).toBeInTheDocument();
  });

  it('renders playlist image when provided', () => {
    render(<PlaylistCard title="My Playlist" image="/playlist.jpg" />);

    const img = screen.getByAltText('My Playlist');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/playlist.jpg');
    expect(img).toHaveClass('playlist-image');
  });

  it('renders placeholder when no image provided', () => {
    render(<PlaylistCard title="My Playlist" />);

    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Image')).toHaveClass('placeholder-image');
  });

  it('renders placeholder when image is null', () => {
    render(<PlaylistCard title="My Playlist" image={null} />);

    expect(screen.getByText('Image')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<PlaylistCard title="My Playlist" onClick={handleClick} />);

    const card = screen.getByText('My Playlist').parentElement;
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies role="button" when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<PlaylistCard title="My Playlist" onClick={handleClick} />);

    const card = screen.getByText('My Playlist').parentElement;
    expect(card).toHaveAttribute('role', 'button');
  });

  it('does not apply role when onClick is not provided', () => {
    render(<PlaylistCard title="My Playlist" />);

    const card = screen.getByText('My Playlist').parentElement;
    expect(card).not.toHaveAttribute('role');
  });

  it('sets tabIndex to 0 when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<PlaylistCard title="My Playlist" onClick={handleClick} />);

    const card = screen.getByText('My Playlist').parentElement;
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('sets tabIndex to -1 when onClick is not provided', () => {
    render(<PlaylistCard title="My Playlist" />);

    const card = screen.getByText('My Playlist').parentElement;
    expect(card).toHaveAttribute('tabIndex', '-1');
  });

  it('applies cursor pointer style when onClick is provided', () => {
    const handleClick = jest.fn();
    render(<PlaylistCard title="My Playlist" onClick={handleClick} />);

    const card = screen.getByText('My Playlist').parentElement;
    expect(card).toHaveStyle({ cursor: 'pointer' });
  });

  it('does not apply cursor pointer style when onClick is not provided', () => {
    render(<PlaylistCard title="My Playlist" />);

    const card = screen.getByText('My Playlist').parentElement;
    expect(card).not.toHaveStyle({ cursor: 'pointer' });
  });

  it('applies playlist-card className', () => {
    const { container } = render(<PlaylistCard title="My Playlist" />);
    expect(container.querySelector('.playlist-card')).toBeInTheDocument();
  });

  it('renders title in h3 tag', () => {
    render(<PlaylistCard title="My Playlist" />);

    const title = screen.getByText('My Playlist');
    expect(title.tagName).toBe('H3');
    expect(title).toHaveClass('playlist-title');
  });

  it('handles empty title', () => {
    render(<PlaylistCard title="" />);
    expect(screen.queryByText('Image')).toBeInTheDocument();
  });

  it('handles long title', () => {
    const longTitle = 'This is a very long playlist title that might overflow';
    render(<PlaylistCard title={longTitle} />);
    expect(screen.getByText(longTitle)).toBeInTheDocument();
  });

  it('handles special characters in title', () => {
    const specialTitle = "Rock & Roll's Greatest Hits!";
    render(<PlaylistCard title={specialTitle} />);
    expect(screen.getByText(specialTitle)).toBeInTheDocument();
  });

  it('handles image URL with query parameters', () => {
    render(<PlaylistCard title="My Playlist" image="/playlist.jpg?size=300" />);

    const img = screen.getByAltText('My Playlist');
    expect(img).toHaveAttribute('src', '/playlist.jpg?size=300');
  });

  it('does not call onClick when card is clicked without handler', () => {
    render(<PlaylistCard title="My Playlist" />);

    const card = screen.getByText('My Playlist').parentElement;
    expect(() => fireEvent.click(card!)).not.toThrow();
  });
});
