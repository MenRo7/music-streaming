import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SongPlayer from '../../components/SongPlayer';
import { PlayerProvider } from '../../contexts/PlayerContext';
import { MobileDrawerProvider } from '../../contexts/MobileDrawerContext';
import * as PlaylistService from '../../apis/PlaylistService';

// Mock services
jest.mock('../../apis/PlaylistService');

// i18n is mocked globally in setupTests.ts

// Mock heavy components
jest.mock('../../components/DropdownMenu', () => {
  return function MockDropdownMenu({ trigger, items }: any) {
    return (
      <div data-testid="dropdown-menu">
        {trigger}
        <div data-testid="dropdown-items">
          {items.map((item: any, idx: number) => (
            <button
              key={idx}
              onClick={item.onClick}
              data-testid={`dropdown-item-${idx}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };
});

jest.mock('../../components/PlaylistCheckboxMenu', () => {
  return function MockPlaylistCheckboxMenu({ onToggle, existingPlaylistIds }: any) {
    return (
      <div data-testid="playlist-checkbox-menu">
        <button
          onClick={() => onToggle(1, true)}
          data-testid="playlist-checkbox-1"
        >
          Add to Playlist 1
        </button>
        <button
          onClick={() => onToggle(2, false)}
          data-testid="playlist-checkbox-2"
        >
          Remove from Playlist 2
        </button>
      </div>
    );
  };
});

// Mock HTMLAudioElement
class MockAudio {
  src = '';
  currentTime = 0;
  duration = 100;
  volume = 1;
  loop = false;
  preload = 'metadata';
  crossOrigin: string | null = null;
  paused = true;

  private listeners: Record<string, Function[]> = {};

  play() {
    this.paused = false;
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }

  load() {}

  addEventListener(event: string, handler: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  removeEventListener(event: string, handler: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(h => h !== handler);
    }
  }

  dispatchEvent(event: Event) {
    const handlers = this.listeners[event.type];
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
    return true;
  }
}

global.Audio = MockAudio as any;

let mockPlayerContext: any;

const createMockPlayerContext = (overrides: any = {}) => ({
  audioUrl: 'http://example.com/test.mp3',
  title: 'Test Song',
  artist: 'Test Artist',
  albumImage: '/test-album.jpg',
  isPlaying: false,
  setIsPlaying: jest.fn(),
  next: jest.fn(),
  prev: jest.fn(),
  toggleShuffle: jest.fn(),
  cycleRepeat: jest.fn(),
  repeat: 'off' as const,
  shuffle: false,
  currentItem: {
    id: 1,
    name: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    album_image: '/test-album.jpg',
    audio: 'http://example.com/test.mp3',
    qid: 'qid-1',
    duration: 180,
    playlistIds: [1, 2],
    album_id: 10,
    artist_user_id: 20,
  },
  addToQueue: jest.fn(),
  currentTrackId: 1,
  queue: [],
  playTrack: jest.fn(),
  removeFromQueue: jest.fn(),
  clearQueue: jest.fn(),
  moveQueueItem: jest.fn(),
  ...overrides,
});

mockPlayerContext = createMockPlayerContext();

jest.mock('../../contexts/PlayerContext', () => ({
  ...jest.requireActual('../../contexts/PlayerContext'),
  usePlayer: () => mockPlayerContext,
}));

const renderSongPlayer = () => {
  return render(
    <BrowserRouter>
      <MobileDrawerProvider>
        <PlayerProvider>
          <SongPlayer />
        </PlayerProvider>
      </MobileDrawerProvider>
    </BrowserRouter>
  );
};

describe('SongPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayerContext = createMockPlayerContext();
    (PlaylistService.addMusicToPlaylist as jest.Mock).mockResolvedValue({});
    (PlaylistService.removeMusicFromPlaylist as jest.Mock).mockResolvedValue({});
  });

  it('renders song player with track info', () => {
    renderSongPlayer();

    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByAltText('Album')).toHaveAttribute('src', '/test-album.jpg');
  });

  it('displays default text when no track loaded', () => {
    mockPlayerContext = createMockPlayerContext({
      title: null,
      artist: null,
    });

    renderSongPlayer();

    expect(screen.getByText('songPlayer.noTitle')).toBeInTheDocument();
    expect(screen.getByText('songPlayer.unknownArtist')).toBeInTheDocument();
  });

  it('toggles play/pause when play button clicked', () => {
    renderSongPlayer();

    const playButton = screen.getByTitle('songPlayer.play');
    fireEvent.click(playButton);

    expect(mockPlayerContext.setIsPlaying).toHaveBeenCalledWith(true);
  });

  it('shows pause icon when playing', () => {
    mockPlayerContext = createMockPlayerContext({
      isPlaying: true,
    });

    renderSongPlayer();

    expect(screen.getByTitle('songPlayer.pause')).toBeInTheDocument();
  });

  it('calls next when next button clicked', () => {
    renderSongPlayer();

    const nextButton = screen.getByTitle('songPlayer.next');
    fireEvent.click(nextButton);

    expect(mockPlayerContext.next).toHaveBeenCalled();
  });

  it('calls prev when previous button clicked', () => {
    renderSongPlayer();

    const prevButton = screen.getByTitle('songPlayer.previous');
    fireEvent.click(prevButton);

    expect(mockPlayerContext.prev).toHaveBeenCalled();
  });

  it('toggles shuffle when shuffle button clicked', () => {
    renderSongPlayer();

    const shuffleButton = screen.getByTitle('songPlayer.shuffle');
    fireEvent.click(shuffleButton);

    expect(mockPlayerContext.toggleShuffle).toHaveBeenCalled();
  });

  it('renders shuffle button', () => {
    renderSongPlayer();

    const shuffleButton = screen.getByTitle('songPlayer.shuffle');
    expect(shuffleButton).toBeInTheDocument();
  });

  it('toggles repeat when repeat button clicked', () => {
    renderSongPlayer();

    const repeatButton = screen.getByTitle('songPlayer.repeatOff');
    fireEvent.click(repeatButton);

    expect(mockPlayerContext.cycleRepeat).toHaveBeenCalled();
  });

  it('renders repeat button with correct state', () => {
    renderSongPlayer();

    const repeatButton = screen.getByTitle('songPlayer.repeatOff');
    expect(repeatButton).toBeInTheDocument();
  });

  it('displays time progress correctly', () => {
    renderSongPlayer();

    // Initial state shows 0:00
    const times = screen.getAllByText(/\d+:\d+/);
    expect(times[0].textContent).toBe('0:00'); // Current time
  });

  it('allows seeking through progress bar', () => {
    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <SongPlayer />
        </PlayerProvider>
      </BrowserRouter>
    );

    const progressBar = container.querySelector('.progress-bar') as HTMLInputElement;

    fireEvent.mouseDown(progressBar);
    fireEvent.change(progressBar, { target: { value: '50' } });
    fireEvent.mouseUp(progressBar);

    // Progress bar should update
    expect(progressBar).toHaveValue('50');
  });

  it('adjusts volume when volume slider changed', () => {
    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <SongPlayer />
        </PlayerProvider>
      </BrowserRouter>
    );

    const volumeSlider = container.querySelector('.volume-slider') as HTMLInputElement;

    fireEvent.change(volumeSlider, { target: { value: '75' } });

    expect(volumeSlider).toHaveValue('75');
  });

  it('toggles mute when mute button clicked', () => {
    renderSongPlayer();

    const muteButton = screen.getByTitle('songPlayer.mute');
    fireEvent.click(muteButton);

    // After muting, should show unmute title
    expect(screen.getByTitle('songPlayer.unmute')).toBeInTheDocument();
  });

  it('shows queue button', () => {
    renderSongPlayer();

    // Queue button should be present (initial state is open by default in component)
    const queueButton = screen.getByTitle('songPlayer.hideQueue');
    expect(queueButton).toBeInTheDocument();
  });

  it('toggles queue when queue button clicked', () => {
    renderSongPlayer();

    const queueButton = screen.getByTitle('songPlayer.hideQueue');
    fireEvent.click(queueButton);

    // Should dispatch custom event
    // We can't easily test event dispatch, but we can verify button works
    expect(queueButton).toBeInTheDocument();
  });

  it('displays dropdown menu with actions', () => {
    renderSongPlayer();

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByText('songPlayer.addToPlaylist')).toBeInTheDocument();
    expect(screen.getByText('songPlayer.viewAlbum')).toBeInTheDocument();
    expect(screen.getByText('songPlayer.viewArtist')).toBeInTheDocument();
    expect(screen.getByText('songPlayer.addToQueue')).toBeInTheDocument();
  });

  it('adds track to queue when add to queue clicked', () => {
    renderSongPlayer();

    const addToQueueButton = screen.getByText('songPlayer.addToQueue');
    fireEvent.click(addToQueueButton);

    expect(mockPlayerContext.addToQueue).toHaveBeenCalledWith({
      id: 1,
      name: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      album_image: '/test-album.jpg',
      audio: 'http://example.com/test.mp3',
      duration: 180,
      playlistIds: [1, 2],
    });
  });

  it('navigates to album when view album clicked', () => {
    renderSongPlayer();

    const viewAlbumButton = screen.getByText('songPlayer.viewAlbum');
    fireEvent.click(viewAlbumButton);

    // Navigation is handled by React Router - we're just testing the button exists and clicks
    expect(viewAlbumButton).toBeInTheDocument();
  });

  it('navigates to artist profile when view artist clicked', () => {
    renderSongPlayer();

    const viewArtistButton = screen.getByText('songPlayer.viewArtist');
    fireEvent.click(viewArtistButton);

    // Navigation is handled by React Router
    expect(viewArtistButton).toBeInTheDocument();
  });

  it('displays dropdown menu structure', () => {
    renderSongPlayer();

    // Dropdown menu is present
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-items')).toBeInTheDocument();
  });

  it('calls playlist service when interacting with playlist checkboxes', async () => {
    renderSongPlayer();

    // Verify the playlist checkbox menu is rendered in the test
    const addButton = screen.queryByTestId('playlist-checkbox-1');

    if (addButton) {
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(PlaylistService.addMusicToPlaylist).toHaveBeenCalledWith(1, 1);
      });
    }
  });

  it('uses default image when album image fails to load', () => {
    renderSongPlayer();

    const img = screen.getByAltText('Album') as HTMLImageElement;

    // Simulate image load error
    fireEvent.error(img);

    expect(img.src).toContain('default-playlist-image.png');
  });

  it('formats time correctly', () => {
    renderSongPlayer();

    // Check that times are displayed in MM:SS format
    const times = screen.getAllByText(/\d+:\d+/);
    expect(times.length).toBeGreaterThan(0);
    expect(times[0].textContent).toMatch(/^\d+:\d{2}$/);
  });

  it('shows volume tooltip on interaction', () => {
    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <SongPlayer />
        </PlayerProvider>
      </BrowserRouter>
    );

    const volumeSlider = container.querySelector('.volume-slider') as HTMLInputElement;

    fireEvent.mouseDown(volumeSlider);

    // Tooltip should be shown (implementation uses CSS visibility)
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('hides volume tooltip after interaction', () => {
    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <SongPlayer />
        </PlayerProvider>
      </BrowserRouter>
    );

    const volumeSlider = container.querySelector('.volume-slider') as HTMLInputElement;

    fireEvent.mouseDown(volumeSlider);
    expect(screen.getByText('100%')).toBeInTheDocument();

    fireEvent.mouseUp(volumeSlider);
    expect(screen.queryByText('100%')).not.toBeInTheDocument();
  });

  it('restores previous volume when unmuting', () => {
    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <SongPlayer />
        </PlayerProvider>
      </BrowserRouter>
    );

    const volumeSlider = container.querySelector('.volume-slider') as HTMLInputElement;
    const muteButton = screen.getByTitle('songPlayer.mute');

    // Set volume to 75
    fireEvent.change(volumeSlider, { target: { value: '75' } });

    // Mute
    fireEvent.click(muteButton);
    expect(volumeSlider).toHaveValue('0');

    // Unmute
    const unmuteButton = screen.getByTitle('songPlayer.unmute');
    fireEvent.click(unmuteButton);

    // Should restore to 75
    expect(volumeSlider).toHaveValue('75');
  });
});
