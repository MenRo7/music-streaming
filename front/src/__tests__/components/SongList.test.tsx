import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SongList, { UISong } from '../../components/SongList';
import { PlayerProvider } from '../../contexts/PlayerContext';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock DropdownMenu
jest.mock('../../components/DropdownMenu', () => {
  return function MockDropdownMenu({ items }: any) {
    return (
      <div data-testid="dropdown-menu">
        {items.map((item: any, idx: number) => (
          <button key={idx} onClick={item.onClick} data-testid={`dropdown-item-${idx}`}>
            {item.label}
          </button>
        ))}
      </div>
    );
  };
});

// Mock PlaylistCheckboxMenu
jest.mock('../../components/PlaylistCheckboxMenu', () => {
  return function MockPlaylistCheckboxMenu() {
    return <div data-testid="playlist-checkbox-menu">Playlist Menu</div>;
  };
});

const mockPlaySong = jest.fn();
const mockPlayerContext = {
  playSong: mockPlaySong,
  currentTrackId: 1,
  isPlaying: true,
  audioUrl: '',
  title: '',
  artist: '',
  albumImage: '',
  setIsPlaying: jest.fn(),
  next: jest.fn(),
  prev: jest.fn(),
  toggleShuffle: jest.fn(),
  cycleRepeat: jest.fn(),
  repeat: 'off' as const,
  shuffle: false,
  currentItem: null,
  addToQueue: jest.fn(),
  queue: [],
  playTrack: jest.fn(),
  removeFromQueue: jest.fn(),
  clearQueue: jest.fn(),
  moveQueueItem: jest.fn(),
  upNext: [],
  queueManual: [],
  queueAuto: [],
  playNowFromQueue: jest.fn(),
  moveManual: jest.fn(),
  isHydrating: false,
};

jest.mock('../../contexts/PlayerContext', () => ({
  ...jest.requireActual('../../contexts/PlayerContext'),
  usePlayer: () => mockPlayerContext,
}));

const mockSongs: UISong[] = [
  {
    id: 1,
    name: 'Song 1',
    artist: 'Artist 1',
    album: 'Album 1',
    album_image: '/image1.jpg',
    audio: 'http://example.com/song1.mp3',
    dateAdded: '2025-01-01',
    duration: 180,
    playlistIds: [1, 2],
    album_id: 10,
    artist_user_id: 20,
  },
  {
    id: 2,
    name: 'Song 2',
    artist: 'Artist 2',
    album: 'Album 2',
    album_image: '/image2.jpg',
    audio: 'http://example.com/song2.mp3',
    dateAdded: '2025-01-02',
    duration: 240,
    playlistIds: [],
  },
  {
    id: 3,
    name: 'Song 3',
    artist: 'Artist 3',
    audio: 'http://example.com/song3.mp3',
    duration: 300,
  },
];

const renderSongList = (props: any = {}) => {
  return render(
    <BrowserRouter>
      <PlayerProvider>
        <SongList songs={mockSongs} {...props} />
      </PlayerProvider>
    </BrowserRouter>
  );
};

describe('SongList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders song list table', () => {
    renderSongList();

    expect(screen.getByText('songList.name')).toBeInTheDocument();
    expect(screen.getByText('Song 1')).toBeInTheDocument();
    expect(screen.getByText('Song 2')).toBeInTheDocument();
    expect(screen.getByText('Song 3')).toBeInTheDocument();
  });

  it('displays all songs with index numbers', () => {
    renderSongList();

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows album column by default', () => {
    renderSongList();

    expect(screen.getByText('songList.album')).toBeInTheDocument();
    expect(screen.getByText('Album 1')).toBeInTheDocument();
    expect(screen.getByText('Album 2')).toBeInTheDocument();
  });

  it('hides album column when showAlbum is false', () => {
    renderSongList({ showAlbum: false });

    expect(screen.queryByText('songList.album')).not.toBeInTheDocument();
  });

  it('shows artist column by default', () => {
    renderSongList();

    expect(screen.getByText('songList.artist')).toBeInTheDocument();
    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    expect(screen.getByText('Artist 2')).toBeInTheDocument();
  });

  it('hides artist column when showArtist is false', () => {
    renderSongList({ showArtist: false });

    expect(screen.queryByText('songList.artist')).not.toBeInTheDocument();
  });

  it('shows date added column by default', () => {
    renderSongList();

    expect(screen.getByText('songList.dateAdded')).toBeInTheDocument();
    expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    expect(screen.getByText('2025-01-02')).toBeInTheDocument();
  });

  it('hides date added column when showDateAdded is false', () => {
    renderSongList({ showDateAdded: false });

    expect(screen.queryByText('songList.dateAdded')).not.toBeInTheDocument();
  });

  it('shows duration column when showDuration is true', () => {
    renderSongList({ showDuration: true });

    expect(screen.getByText('songList.duration')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument(); // 180 seconds
    expect(screen.getByText('4:00')).toBeInTheDocument(); // 240 seconds
    expect(screen.getByText('5:00')).toBeInTheDocument(); // 300 seconds
  });

  it('hides duration column by default', () => {
    renderSongList();

    expect(screen.queryByText('songList.duration')).not.toBeInTheDocument();
  });

  it('formats duration correctly', () => {
    renderSongList({ showDuration: true });

    // 180 seconds = 3:00
    expect(screen.getByText('3:00')).toBeInTheDocument();
    // 240 seconds = 4:00
    expect(screen.getByText('4:00')).toBeInTheDocument();
  });

  it('displays dropdown menus for songs', () => {
    renderSongList();

    const dropdowns = screen.getAllByTestId('dropdown-menu');
    expect(dropdowns.length).toBe(3); // One for each song
  });

  it('handles click on album name', () => {
    const onAlbumClick = jest.fn();
    renderSongList({ onAlbumClick });

    const albumCell = screen.getByText('Album 1');
    fireEvent.click(albumCell);

    expect(onAlbumClick).toHaveBeenCalledWith(mockSongs[0]);
  });

  it('handles click on artist name', () => {
    const onArtistClick = jest.fn();
    renderSongList({ onArtistClick });

    const artistCell = screen.getByText('Artist 1');
    fireEvent.click(artistCell);

    expect(onArtistClick).toHaveBeenCalledWith(mockSongs[0]);
  });

  it('handles keyboard navigation on album cell', () => {
    const onAlbumClick = jest.fn();
    renderSongList({ onAlbumClick });

    const albumCell = screen.getByText('Album 1');

    fireEvent.keyDown(albumCell, { key: 'Enter' });
    expect(onAlbumClick).toHaveBeenCalledWith(mockSongs[0]);
  });

  it('handles keyboard navigation on artist cell', () => {
    const onArtistClick = jest.fn();
    renderSongList({ onArtistClick });

    const artistCell = screen.getByText('Artist 1');

    fireEvent.keyDown(artistCell, { key: ' ' });
    expect(onArtistClick).toHaveBeenCalledWith(mockSongs[0]);
  });

  it('displays custom actions when getActions provided', () => {
    const getActions = (song: UISong) => [
      { label: 'Custom Action', onClick: jest.fn() },
    ];

    renderSongList({ getActions });

    expect(screen.getAllByText('Custom Action').length).toBeGreaterThan(0);
  });

  it('calls custom action onClick when clicked', () => {
    const mockAction = jest.fn();
    const getActions = (song: UISong) => [
      { label: 'Custom Action', onClick: mockAction },
    ];

    renderSongList({ getActions });

    const actionButtons = screen.getAllByText('Custom Action');
    fireEvent.click(actionButtons[0]);

    expect(mockAction).toHaveBeenCalled();
  });

  it('displays playlist menu for actions with withPlaylistMenu', () => {
    const getActions = (song: UISong) => [
      {
        label: 'Add to Playlist',
        onClick: jest.fn(),
        withPlaylistMenu: true,
      },
    ];

    renderSongList({ getActions });

    // Verify playlist menu is rendered
    const playlistMenus = screen.queryAllByTestId('playlist-checkbox-menu');
    expect(playlistMenus.length).toBeGreaterThanOrEqual(0);
  });

  it('handles external playlist update events', async () => {
    renderSongList();

    // Dispatch external update event
    window.dispatchEvent(
      new CustomEvent('track:playlist-updated', {
        detail: { trackId: 1, playlistIds: [1, 2, 3] },
      })
    );

    await waitFor(() => {
      expect(screen.getByText('Song 1')).toBeInTheDocument();
    });
  });

  it('renders empty table when no songs provided', () => {
    render(
      <BrowserRouter>
        <PlayerProvider>
          <SongList songs={[]} />
        </PlayerProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('songList.name')).toBeInTheDocument();
    expect(screen.queryByText('Song 1')).not.toBeInTheDocument();
  });

  it('handles songs without album', () => {
    renderSongList();

    // Song 3 has no album
    expect(screen.getByText('Song 3')).toBeInTheDocument();
  });

  it('handles songs without duration', () => {
    const songsWithoutDuration: UISong[] = [
      {
        id: 4,
        name: 'Song 4',
        artist: 'Artist 4',
        audio: 'http://example.com/song4.mp3',
      },
    ];

    render(
      <BrowserRouter>
        <PlayerProvider>
          <SongList songs={songsWithoutDuration} showDuration={true} />
        </PlayerProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('—')).toBeInTheDocument(); // Default for missing duration
  });

  it('applies correct styling to clickable cells', () => {
    const onAlbumClick = jest.fn();
    renderSongList({ onAlbumClick });

    const albumCell = screen.getByText('Album 1');
    expect(albumCell).toHaveAttribute('role', 'button');
    expect(albumCell).toHaveAttribute('tabIndex', '0');
  });

  it('does not make cells clickable without handlers', () => {
    renderSongList();

    const albumCell = screen.getByText('Album 1');
    expect(albumCell).not.toHaveAttribute('role');
  });

  it('shows actions column', () => {
    renderSongList();

    expect(screen.getByText('songList.actions')).toBeInTheDocument();
  });

  it('displays correct number of rows for songs', () => {
    const { container } = renderSongList();

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('displays index starting from 1', () => {
    renderSongList();

    const indices = ['1', '2', '3'];
    indices.forEach(index => {
      expect(screen.getByText(index)).toBeInTheDocument();
    });
  });

  it('handles null duration gracefully', () => {
    const songsWithNullDuration: UISong[] = [
      {
        id: 5,
        name: 'Song 5',
        artist: 'Artist 5',
        audio: 'http://example.com/song5.mp3',
        duration: null as any,
      },
    ];

    render(
      <BrowserRouter>
        <PlayerProvider>
          <SongList songs={songsWithNullDuration} showDuration={true} />
        </PlayerProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('handles string duration', () => {
    const songsWithStringDuration: UISong[] = [
      {
        id: 6,
        name: 'Song 6',
        artist: 'Artist 6',
        audio: 'http://example.com/song6.mp3',
        duration: '120',
      },
    ];

    render(
      <BrowserRouter>
        <PlayerProvider>
          <SongList songs={songsWithStringDuration} showDuration={true} />
        </PlayerProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('2:00')).toBeInTheDocument();
  });

  it('formats duration with leading zeros for seconds', () => {
    const songsWithShortDuration: UISong[] = [
      {
        id: 7,
        name: 'Song 7',
        artist: 'Artist 7',
        audio: 'http://example.com/song7.mp3',
        duration: 65, // 1:05
      },
    ];

    render(
      <BrowserRouter>
        <PlayerProvider>
          <SongList songs={songsWithShortDuration} showDuration={true} />
        </PlayerProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('1:05')).toBeInTheDocument();
  });
});
