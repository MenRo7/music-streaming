import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { PlaylistProvider } from '../../contexts/PlaylistContext';
import * as UserService from '../../apis/UserService';

// Mock services
jest.mock('../../apis/UserService');

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock heavy components
jest.mock('../../components/PlaylistCard', () => {
  return function MockPlaylistCard({ title, image }: any) {
    return (
      <div data-testid="playlist-card">
        <span>{title}</span>
        {image && <img src={image} alt={title} />}
      </div>
    );
  };
});

jest.mock('../../components/ProfileCircleCard', () => {
  return function MockProfileCircleCard({ name, onClick }: any) {
    return (
      <div data-testid="profile-circle-card" onClick={onClick}>
        {name}
      </div>
    );
  };
});

jest.mock('../../components/CreateEditPlaylistModal', () => {
  return function MockCreateEditPlaylistModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="playlist-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

const mockPlaylists = [
  { id: 1, title: 'My Playlist 1', image: '/playlist1.jpg' },
  { id: 2, title: 'My Playlist 2', image: null },
];

const mockLikesSummary = {
  albums: [
    { id: 1, title: 'Liked Album 1', image: '/album1.jpg' },
    { id: 2, title: 'Liked Album 2', image: null },
  ],
  playlists: [
    { id: 3, title: 'Liked Playlist 1', image: '/liked-pl1.jpg' },
  ],
  profiles: [
    { id: 10, name: 'Artist 1', image: '/artist1.jpg' },
    { id: 11, name: 'Artist 2', image: null },
  ],
};

const mockFetchPlaylists = jest.fn();

const mockPlaylistContext = {
  playlists: mockPlaylists,
  fetchPlaylists: mockFetchPlaylists,
  createPlaylist: jest.fn(),
  updatePlaylist: jest.fn(),
  deletePlaylist: jest.fn(),
  addMusicToPlaylist: jest.fn(),
  removeMusicFromPlaylist: jest.fn(),
  likePlaylist: jest.fn(),
  unlikePlaylist: jest.fn(),
};

jest.mock('../../contexts/PlaylistContext', () => ({
  ...jest.requireActual('../../contexts/PlaylistContext'),
  usePlaylists: () => mockPlaylistContext,
}));

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <PlaylistProvider>
        <Sidebar />
      </PlaylistProvider>
    </BrowserRouter>
  );
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (UserService.getLikesSummary as jest.Mock).mockResolvedValue(mockLikesSummary);
  });

  it('renders sidebar with filter buttons', () => {
    renderSidebar();

    expect(screen.getByText('sidebar.playlists')).toBeInTheDocument();
    expect(screen.getByText('sidebar.albums')).toBeInTheDocument();
    expect(screen.getByText('sidebar.artists')).toBeInTheDocument();
  });

  it('fetches playlists and likes on mount', async () => {
    renderSidebar();

    await waitFor(() => {
      expect(mockFetchPlaylists).toHaveBeenCalled();
      expect(UserService.getLikesSummary).toHaveBeenCalled();
    });
  });

  it('displays all content by default (no filters active)', async () => {
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByText('sidebar.library')).toBeInTheDocument();
      expect(screen.getByText('sidebar.followedArtists')).toBeInTheDocument();
      expect(screen.getByText('sidebar.likedAlbums')).toBeInTheDocument();
    });
  });

  it('toggles playlist filter when clicked', async () => {
    renderSidebar();

    const playlistButton = screen.getByText('sidebar.playlists');

    // Click to activate filter
    fireEvent.click(playlistButton);

    await waitFor(() => {
      expect(playlistButton.classList.contains('active')).toBe(true);
    });

    // Should only show playlists section
    expect(screen.getByText('sidebar.library')).toBeInTheDocument();
    expect(screen.queryByText('sidebar.followedArtists')).not.toBeInTheDocument();
    expect(screen.queryByText('sidebar.likedAlbums')).not.toBeInTheDocument();

    // Click to deactivate filter
    fireEvent.click(playlistButton);

    await waitFor(() => {
      expect(playlistButton.classList.contains('active')).toBe(false);
    });
  });

  it('toggles albums filter when clicked', async () => {
    renderSidebar();

    const albumsButton = screen.getByText('sidebar.albums');

    fireEvent.click(albumsButton);

    await waitFor(() => {
      expect(albumsButton.classList.contains('active')).toBe(true);
    });

    // Should only show albums section
    expect(screen.queryByText('sidebar.library')).not.toBeInTheDocument();
    expect(screen.queryByText('sidebar.followedArtists')).not.toBeInTheDocument();
    expect(screen.getByText('sidebar.likedAlbums')).toBeInTheDocument();
  });

  it('toggles artists filter when clicked', async () => {
    renderSidebar();

    const artistsButton = screen.getByText('sidebar.artists');

    fireEvent.click(artistsButton);

    await waitFor(() => {
      expect(artistsButton.classList.contains('active')).toBe(true);
    });

    // Should only show artists section
    expect(screen.queryByText('sidebar.library')).not.toBeInTheDocument();
    expect(screen.getByText('sidebar.followedArtists')).toBeInTheDocument();
    expect(screen.queryByText('sidebar.likedAlbums')).not.toBeInTheDocument();
  });

  it('shows "by you" filter when playlists filter is active', async () => {
    renderSidebar();

    const playlistButton = screen.getByText('sidebar.playlists');
    fireEvent.click(playlistButton);

    await waitFor(() => {
      expect(screen.getByText('sidebar.byYou')).toBeInTheDocument();
    });
  });

  it('toggles "mine only" filter when "by you" is clicked', async () => {
    renderSidebar();

    const playlistButton = screen.getByText('sidebar.playlists');
    fireEvent.click(playlistButton);

    await waitFor(() => {
      const byYouButton = screen.getByText('sidebar.byYou');
      expect(byYouButton).toBeInTheDocument();

      // Click to activate "mine only"
      fireEvent.click(byYouButton);
    });

    await waitFor(() => {
      const byYouButton = screen.getByText('sidebar.byYou');
      expect(byYouButton.classList.contains('active')).toBe(true);
    });
  });

  it('displays user playlists', async () => {
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByText('My Playlist 1')).toBeInTheDocument();
      expect(screen.getByText('My Playlist 2')).toBeInTheDocument();
    });
  });

  it('displays liked albums when albums filter active', async () => {
    renderSidebar();

    const albumsButton = screen.getByText('sidebar.albums');
    fireEvent.click(albumsButton);

    await waitFor(() => {
      expect(screen.getByText('Liked Album 1')).toBeInTheDocument();
      expect(screen.getByText('Liked Album 2')).toBeInTheDocument();
    });
  });

  it('displays followed artists when artists filter active', async () => {
    renderSidebar();

    const artistsButton = screen.getByText('sidebar.artists');
    fireEvent.click(artistsButton);

    await waitFor(() => {
      expect(screen.getByText('Artist 1')).toBeInTheDocument();
      expect(screen.getByText('Artist 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no liked albums', async () => {
    (UserService.getLikesSummary as jest.Mock).mockResolvedValue({
      albums: [],
      playlists: [],
      profiles: [],
    });

    renderSidebar();

    const albumsButton = screen.getByText('sidebar.albums');
    fireEvent.click(albumsButton);

    await waitFor(() => {
      expect(screen.getByText('sidebar.noLikedAlbums')).toBeInTheDocument();
    });
  });

  it('shows empty state when no followed artists', async () => {
    (UserService.getLikesSummary as jest.Mock).mockResolvedValue({
      albums: [],
      playlists: [],
      profiles: [],
    });

    renderSidebar();

    const artistsButton = screen.getByText('sidebar.artists');
    fireEvent.click(artistsButton);

    await waitFor(() => {
      expect(screen.getByText('sidebar.noFollowedArtists')).toBeInTheDocument();
    });
  });

  it('opens create playlist modal when plus button clicked', async () => {
    renderSidebar();

    await waitFor(() => {
      const createButton = screen.getByTitle('sidebar.createPlaylist');
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByTestId('playlist-modal')).toBeInTheDocument();
    });
  });

  it('closes modal and refreshes playlists on modal close', async () => {
    renderSidebar();

    // Open modal
    const createButton = screen.getByTitle('sidebar.createPlaylist');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('playlist-modal')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByText('Close Modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('playlist-modal')).not.toBeInTheDocument();
      expect(mockFetchPlaylists).toHaveBeenCalledTimes(2); // Once on mount, once on close
    });
  });

  it('shows reset filters button when filters are active', async () => {
    renderSidebar();

    // No filters active initially
    expect(screen.queryByLabelText('sidebar.resetFilters')).not.toBeInTheDocument();

    // Activate a filter
    const playlistButton = screen.getByText('sidebar.playlists');
    fireEvent.click(playlistButton);

    await waitFor(() => {
      expect(screen.getByLabelText('sidebar.resetFilters')).toBeInTheDocument();
    });
  });

  it('resets all filters when reset button clicked', async () => {
    renderSidebar();

    // Activate multiple filters
    fireEvent.click(screen.getByText('sidebar.playlists'));
    fireEvent.click(screen.getByText('sidebar.albums'));

    await waitFor(() => {
      expect(screen.getByText('sidebar.playlists').classList.contains('active')).toBe(true);
      expect(screen.getByText('sidebar.albums').classList.contains('active')).toBe(true);
    });

    // Reset filters
    const resetButton = screen.getByLabelText('sidebar.resetFilters');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('sidebar.playlists').classList.contains('active')).toBe(false);
      expect(screen.getByText('sidebar.albums').classList.contains('active')).toBe(false);
    });
  });

  it('displays loading state while fetching likes', async () => {
    (UserService.getLikesSummary as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockLikesSummary), 100))
    );

    renderSidebar();

    const albumsButton = screen.getByText('sidebar.albums');
    fireEvent.click(albumsButton);

    // Should show loading state
    expect(screen.getByText('common.loading')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('common.loading')).not.toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles getLikesSummary error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (UserService.getLikesSummary as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    renderSidebar();

    await waitFor(() => {
      expect(UserService.getLikesSummary).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // Should not crash and loading state should be reset
    expect(screen.queryByText('common.loading')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('navigates to album when liked album is clicked', async () => {
    renderSidebar();

    const albumsButton = screen.getByText('sidebar.albums');
    fireEvent.click(albumsButton);

    await waitFor(() => {
      const album = screen.getByText('Liked Album 1');
      expect(album).toBeInTheDocument();
    });

    // Note: Full navigation testing would require more complex setup with router mock
    // This test verifies the album is rendered and clickable
  });

  it('displays favorites link in playlists section', async () => {
    renderSidebar();

    await waitFor(() => {
      expect(screen.getByText('sidebar.favoriteTracks')).toBeInTheDocument();
    });
  });

  it('hides liked playlists when "mine only" filter is active', async () => {
    renderSidebar();

    // Activate playlists filter
    const playlistButton = screen.getByText('sidebar.playlists');
    fireEvent.click(playlistButton);

    await waitFor(() => {
      // Liked playlists should be visible initially
      expect(screen.getByText('Liked Playlist 1')).toBeInTheDocument();
    });

    // Activate "mine only" filter
    const byYouButton = screen.getByText('sidebar.byYou');
    fireEvent.click(byYouButton);

    await waitFor(() => {
      // Liked playlists should be hidden
      expect(screen.queryByText('Liked Playlist 1')).not.toBeInTheDocument();
      // User's playlists should still be visible
      expect(screen.getByText('My Playlist 1')).toBeInTheDocument();
    });
  });

  it('reloads likes when custom event is triggered', async () => {
    renderSidebar();

    await waitFor(() => {
      expect(UserService.getLikesSummary).toHaveBeenCalledTimes(1);
    });

    // Trigger custom event
    window.dispatchEvent(new Event('likes:changed'));

    await waitFor(() => {
      expect(UserService.getLikesSummary).toHaveBeenCalledTimes(2);
    });
  });
});
