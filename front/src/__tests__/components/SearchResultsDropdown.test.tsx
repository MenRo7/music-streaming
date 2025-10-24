import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchResultsDropdown from '../../components/SearchResultsDropdown';
import { PlayerProvider } from '../../contexts/PlayerContext';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <PlayerProvider>
      {ui}
    </PlayerProvider>
  );
};

describe('SearchResultsDropdown', () => {
  const mockOnClose = jest.fn();
  const mockOnLoadMore = jest.fn();
  const mockOnAlbumClick = jest.fn();
  const mockOnPlaylistClick = jest.fn();
  const mockOnUserClick = jest.fn();
  const mockOnTrackClick = jest.fn();

  const mockUsers = [
    { id: 1, name: 'User 1', profile_image: 'user1.jpg' },
    { id: 2, name: 'User 2', profile_image: null },
  ];

  const mockPlaylists = [
    { id: 1, title: 'Playlist 1', image: 'pl1.jpg' },
    { id: 2, title: 'Playlist 2', image: null },
  ];

  const mockMusics = [
    { id: 1, title: 'Song 1', artist_name: 'Artist 1', image: 'song1.jpg', audio: 'song1.mp3' },
    { id: 2, title: 'Song 2', artist_name: null, image: null, audio: 'song2.mp3' },
  ];

  const mockAlbums = [
    { id: 1, title: 'Album 1', image: 'album1.jpg', artist_name: 'Artist 1' },
    { id: 2, title: 'Album 2', image: null, artist_name: 'Artist 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    const { container } = renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={[]}
        albums={[]}
        visible={false}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when visible is true', () => {
    const { container } = renderWithProviders(
      <SearchResultsDropdown
        users={mockUsers}
        playlists={[]}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(container.querySelector('.search-results-dropdown')).toBeInTheDocument();
  });

  it('should render users section when users exist', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={mockUsers}
        playlists={[]}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(screen.getByText(/utilisateurs/i)).toBeInTheDocument();
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText('User 2')).toBeInTheDocument();
  });

  it('should render playlists section when playlists exist', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={mockPlaylists}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(screen.getByText(/playlists/i)).toBeInTheDocument();
    expect(screen.getByText('Playlist 1')).toBeInTheDocument();
    expect(screen.getByText('Playlist 2')).toBeInTheDocument();
  });

  it('should render musics section when musics exist', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={mockMusics}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(screen.getByText(/morceaux/i)).toBeInTheDocument();
    expect(screen.getByText(/Song 1 - Artist 1/i)).toBeInTheDocument();
  });

  it('should render albums section when albums exist', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={[]}
        albums={mockAlbums}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(screen.getByText(/albums/i)).toBeInTheDocument();
    expect(screen.getByText('Album 1')).toBeInTheDocument();
    expect(screen.getByText('Album 2')).toBeInTheDocument();
  });

  it('should call onUserClick when user is clicked', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={mockUsers}
        playlists={[]}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
        onUserClick={mockOnUserClick}
      />
    );

    const userItem = screen.getByText('User 1');
    fireEvent.click(userItem);

    expect(mockOnUserClick).toHaveBeenCalledWith(1);
  });

  it('should call onPlaylistClick when playlist is clicked', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={mockPlaylists}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
        onPlaylistClick={mockOnPlaylistClick}
      />
    );

    const playlistItem = screen.getByText('Playlist 1');
    fireEvent.click(playlistItem);

    expect(mockOnPlaylistClick).toHaveBeenCalledWith(1);
  });

  it('should call onAlbumClick when album is clicked', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={[]}
        albums={mockAlbums}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
        onAlbumClick={mockOnAlbumClick}
      />
    );

    const albumItem = screen.getByText('Album 1');
    fireEvent.click(albumItem);

    expect(mockOnAlbumClick).toHaveBeenCalledWith(1);
  });

  it('should call onTrackClick when music track is clicked', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={mockMusics}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
        onTrackClick={mockOnTrackClick}
      />
    );

    const trackItem = screen.getByText(/Song 1 - Artist 1/i);
    fireEvent.click(trackItem);

    expect(mockOnTrackClick).toHaveBeenCalledWith(mockMusics[0]);
  });

  it('should show loading indicator when loadingMore is true', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
        loadingMore={true}
      />
    );

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('should not show loading indicator when loadingMore is false', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
        loadingMore={false}
      />
    );

    expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument();
  });

  it('should render all sections when all data types exist', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={mockUsers}
        playlists={mockPlaylists}
        musics={mockMusics}
        albums={mockAlbums}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(screen.getByText(/utilisateurs/i)).toBeInTheDocument();
    expect(screen.getByText(/playlists/i)).toBeInTheDocument();
    expect(screen.getByText(/morceaux/i)).toBeInTheDocument();
    expect(screen.getByText(/albums/i)).toBeInTheDocument();
  });

  it('should not render sections with empty data', () => {
    renderWithProviders(
      <SearchResultsDropdown
        users={[]}
        playlists={[]}
        musics={[]}
        albums={[]}
        visible={true}
        onClose={mockOnClose}
        onLoadMore={mockOnLoadMore}
      />
    );

    expect(screen.queryByText(/utilisateurs/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/playlists/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/morceaux/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/albums/i)).not.toBeInTheDocument();
  });
});
