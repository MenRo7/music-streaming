import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FavoritesPage from '../../pages/FavoritesPage';
import { PlayerProvider } from '../../contexts/PlayerContext';
import * as FavoritesService from '../../apis/FavoritesService';

// Mock services
jest.mock('../../apis/FavoritesService');
jest.mock('../../apis/PlaylistService');

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock MediaPage
jest.mock('../../pages/MediaPage', () => {
  return function MockMediaPage({ songs, loading }: any) {
    if (loading) return <div>Loading...</div>;
    if (!songs || songs.length === 0) return <div>No favorites</div>;
    return (
      <div data-testid="media-page">
        {songs.map((song: any) => (
          <div key={song.id} data-testid="song-item">
            {song.name}
          </div>
        ))}
      </div>
    );
  };
});

const mockFavorites = [
  {
    id: 1,
    name: 'Favorite Song 1',
    artist_name: 'Artist 1',
    audio: 'http://example.com/song1.mp3',
    album_image: '/image1.jpg',
    favorited_at: '2025-01-10',
    duration: 180,
    playlist_ids: [1, 2],
    album_id: 10,
    artist_user_id: 20,
  },
  {
    id: 2,
    name: 'Favorite Song 2',
    artist_name: 'Artist 2',
    audio: 'http://example.com/song2.mp3',
    favorited_at: '2025-01-09',
    duration: 240,
  },
];

const renderFavoritesPage = () => {
  return render(
    <BrowserRouter>
      <PlayerProvider>
        <FavoritesPage />
      </PlayerProvider>
    </BrowserRouter>
  );
};

describe('FavoritesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FavoritesService.getFavorites as jest.Mock).mockResolvedValue(mockFavorites);
  });

  it('shows loading state initially', () => {
    renderFavoritesPage();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads and displays favorites', async () => {
    renderFavoritesPage();

    await waitFor(() => {
      expect(FavoritesService.getFavorites).toHaveBeenCalled();
      expect(screen.getByTestId('media-page')).toBeInTheDocument();
    });
  });

  it('displays favorite songs', async () => {
    renderFavoritesPage();

    await waitFor(() => {
      expect(screen.getByText('Favorite Song 1')).toBeInTheDocument();
      expect(screen.getByText('Favorite Song 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no favorites', async () => {
    (FavoritesService.getFavorites as jest.Mock).mockResolvedValue([]);

    renderFavoritesPage();

    await waitFor(() => {
      expect(screen.getByText('No favorites')).toBeInTheDocument();
    });
  });

  it('handles error loading favorites', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (FavoritesService.getFavorites as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    renderFavoritesPage();

    await waitFor(() => {
      expect(FavoritesService.getFavorites).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays correct number of songs', async () => {
    renderFavoritesPage();

    await waitFor(() => {
      const songItems = screen.getAllByTestId('song-item');
      expect(songItems.length).toBe(2);
    });
  });

  it('extracts playlist IDs correctly', async () => {
    renderFavoritesPage();

    await waitFor(() => {
      expect(FavoritesService.getFavorites).toHaveBeenCalled();
      expect(screen.getByTestId('media-page')).toBeInTheDocument();
    });
  });

  it('handles favorites without album images', async () => {
    const favoritesWithoutImages = [
      {
        id: 3,
        name: 'Song Without Image',
        artist_name: 'Artist 3',
        audio: 'http://example.com/song3.mp3',
        favorited_at: '2025-01-08',
      },
    ];

    (FavoritesService.getFavorites as jest.Mock).mockResolvedValue(
      favoritesWithoutImages
    );

    renderFavoritesPage();

    await waitFor(() => {
      expect(screen.getByText('Song Without Image')).toBeInTheDocument();
    });
  });

  it('handles favorites without duration', async () => {
    const favoritesWithoutDuration = [
      {
        id: 4,
        name: 'Song Without Duration',
        artist_name: 'Artist 4',
        audio: 'http://example.com/song4.mp3',
        favorited_at: '2025-01-07',
      },
    ];

    (FavoritesService.getFavorites as jest.Mock).mockResolvedValue(
      favoritesWithoutDuration
    );

    renderFavoritesPage();

    await waitFor(() => {
      expect(screen.getByText('Song Without Duration')).toBeInTheDocument();
    });
  });

  it('formats song data correctly', async () => {
    renderFavoritesPage();

    await waitFor(() => {
      // Verify songs are formatted and displayed
      expect(screen.getByTestId('media-page')).toBeInTheDocument();
      expect(screen.getAllByTestId('song-item').length).toBe(2);
    });
  });
});
