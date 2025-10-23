import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SongCard from '../../components/SongCard';
import { Song } from '../../utils/types';

const mockSong: Song = {
  _id: '123',
  title: 'Test Song',
  artist: 'Test Artist',
  album: 'Test Album',
  duration: 180,
  url: 'http://example.com/song.mp3',
};

const renderSongCard = (song: Song = mockSong) => {
  return render(
    <BrowserRouter>
      <SongCard song={song} />
    </BrowserRouter>
  );
};

describe('SongCard', () => {
  it('renders song title', () => {
    renderSongCard();
    expect(screen.getByText('Test Song')).toBeInTheDocument();
  });

  it('renders song artist', () => {
    renderSongCard();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('renders play link', () => {
    renderSongCard();
    const playLink = screen.getByText('Play');
    expect(playLink).toBeInTheDocument();
    expect(playLink).toHaveAttribute('href', '/songs/123');
  });

  it('renders with custom song data', () => {
    const customSong: Song = {
      _id: '456',
      title: 'Custom Song',
      artist: 'Custom Artist',
      album: 'Custom Album',
      duration: 240,
      url: 'http://example.com/custom.mp3',
    };

    renderSongCard(customSong);

    expect(screen.getByText('Custom Song')).toBeInTheDocument();
    expect(screen.getByText('Custom Artist')).toBeInTheDocument();
    expect(screen.getByText('Play')).toHaveAttribute('href', '/songs/456');
  });

  it('applies songCard className', () => {
    const { container } = renderSongCard();
    expect(container.querySelector('.songCard')).toBeInTheDocument();
  });

  it('renders song title in h3 tag', () => {
    renderSongCard();
    const title = screen.getByText('Test Song');
    expect(title.tagName).toBe('H3');
  });

  it('renders song artist in p tag', () => {
    renderSongCard();
    const artist = screen.getByText('Test Artist');
    expect(artist.tagName).toBe('P');
  });
});
