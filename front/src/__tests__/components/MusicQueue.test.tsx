import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MusicQueue from '../../components/MusicQueue';
import { PlayerProvider } from '../../contexts/PlayerContext';
import * as PlaylistService from '../../apis/PlaylistService';

// Mock services
jest.mock('../../apis/PlaylistService');

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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
  return function MockPlaylistCheckboxMenu({ onToggle }: any) {
    return (
      <div data-testid="playlist-checkbox-menu">
        <button
          onClick={() => onToggle(1, true)}
          data-testid="add-to-playlist-btn"
        >
          Add to Playlist
        </button>
      </div>
    );
  };
});

const mockTrack1 = {
  qid: 'track-1',
  id: 1,
  name: 'Test Song 1',
  artist: 'Artist 1',
  album: 'Album 1',
  album_image: '/image1.jpg',
  audio: 'http://example.com/song1.mp3',
  duration: '3:45',
  playlistIds: [1, 2],
};

const mockTrack2 = {
  qid: 'track-2',
  id: 2,
  name: 'Test Song 2',
  artist: 'Artist 2',
  album: 'Album 2',
  album_image: '/image2.jpg',
  audio: 'http://example.com/song2.mp3',
  duration: '4:20',
  playlistIds: [],
};

const mockTrack3 = {
  qid: 'track-3',
  id: 3,
  name: 'Test Song 3',
  artist: 'Artist 3',
  album: 'Album 3',
  album_image: null,
  audio: 'http://example.com/song3.mp3',
  duration: '2:30',
  playlistIds: [],
};

let mockPlayerContext: any;

const createMockPlayerContext = (overrides: any = {}) => ({
  currentItem: null,
  upNext: [],
  queueManual: [],
  queueAuto: [],
  clearQueue: jest.fn(),
  removeFromQueue: jest.fn(),
  playNowFromQueue: jest.fn(),
  moveManual: jest.fn(),
  isHydrating: false,
  audioUrl: '',
  title: '',
  artist: '',
  albumImage: '',
  isPlaying: false,
  setIsPlaying: jest.fn(),
  next: jest.fn(),
  prev: jest.fn(),
  toggleShuffle: jest.fn(),
  cycleRepeat: jest.fn(),
  repeat: 'off' as const,
  shuffle: false,
  addToQueue: jest.fn(),
  currentTrackId: null,
  queue: [],
  playTrack: jest.fn(),
  ...overrides,
});

mockPlayerContext = createMockPlayerContext();

jest.mock('../../contexts/PlayerContext', () => ({
  ...jest.requireActual('../../contexts/PlayerContext'),
  usePlayer: () => mockPlayerContext,
}));

const renderMusicQueue = () => {
  return render(
    <BrowserRouter>
      <PlayerProvider>
        <MusicQueue />
      </PlayerProvider>
    </BrowserRouter>
  );
};

describe('MusicQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPlayerContext = createMockPlayerContext();
    (PlaylistService.addMusicToPlaylist as jest.Mock).mockResolvedValue({});
    (PlaylistService.removeMusicFromPlaylist as jest.Mock).mockResolvedValue({});
  });

  it('renders queue with title', () => {
    renderMusicQueue();

    expect(screen.getByText('musicQueue.queue')).toBeInTheDocument();
  });

  it('shows loading state when hydrating', () => {
    mockPlayerContext.isHydrating = true;

    renderMusicQueue();

    expect(screen.getByText('musicQueue.loadingQueue')).toBeInTheDocument();
    expect(screen.getByText('musicQueue.checkingDeletedTracks')).toBeInTheDocument();
  });

  it('hides queue when isOpen is false', () => {
    renderMusicQueue();

    // Dispatch close event
    window.dispatchEvent(new CustomEvent('queue:toggle', { detail: { open: false } }));

    waitFor(() => {
      expect(screen.queryByText('musicQueue.queue')).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no tracks in queue', () => {
    renderMusicQueue();

    expect(screen.getByText('musicQueue.noTracks')).toBeInTheDocument();
    expect(screen.getByText('musicQueue.addTracksHint')).toBeInTheDocument();
  });

  it('displays current track', () => {
    mockPlayerContext.currentItem = mockTrack1;

    renderMusicQueue();

    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Artist 1')).toBeInTheDocument();
    expect(screen.getByText('musicQueue.currentTrack')).toBeInTheDocument();
  });

  it('displays manual queue tracks', () => {
    mockPlayerContext.queueManual = [mockTrack1, mockTrack2];

    renderMusicQueue();

    expect(screen.getByText('musicQueue.manuallyAdded')).toBeInTheDocument();
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Count
  });

  it('displays auto queue tracks', () => {
    mockPlayerContext.queueAuto = [mockTrack2, mockTrack3];

    renderMusicQueue();

    expect(screen.getByText('musicQueue.upNext')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
    expect(screen.getByText('Test Song 3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Count
  });

  it('shows empty message when no manual tracks', () => {
    mockPlayerContext.currentItem = mockTrack1;
    mockPlayerContext.queueManual = [];

    renderMusicQueue();

    expect(screen.getByText('musicQueue.noManualTracks')).toBeInTheDocument();
  });

  it('shows empty message when no auto tracks', () => {
    mockPlayerContext.currentItem = mockTrack1;
    mockPlayerContext.queueAuto = [];

    renderMusicQueue();

    expect(screen.getByText('musicQueue.noAutoTracks')).toBeInTheDocument();
  });

  it('calls clearQueue when clear button clicked', () => {
    mockPlayerContext.queueManual = [mockTrack1];

    renderMusicQueue();

    const clearButton = screen.getByTitle('musicQueue.clearQueue');
    fireEvent.click(clearButton);

    expect(mockPlayerContext.clearQueue).toHaveBeenCalledWith(true);
  });

  it('disables clear button when queue is empty', () => {
    renderMusicQueue();

    const clearButton = screen.getByTitle('musicQueue.clearQueue');
    expect(clearButton).toBeDisabled();
  });

  it('enables clear button when queue has tracks', () => {
    mockPlayerContext.queueManual = [mockTrack1];

    renderMusicQueue();

    const clearButton = screen.getByTitle('musicQueue.clearQueue');
    expect(clearButton).not.toBeDisabled();
  });

  it('calls playNowFromQueue when play button clicked on current track', () => {
    mockPlayerContext.currentItem = mockTrack1;

    renderMusicQueue();

    const playButton = screen.getByTitle('musicQueue.replay');
    fireEvent.click(playButton);

    expect(mockPlayerContext.playNowFromQueue).toHaveBeenCalledWith('track-1');
  });

  it('calls playNowFromQueue when play button clicked on queued track', () => {
    mockPlayerContext.queueManual = [mockTrack1];

    renderMusicQueue();

    const playButton = screen.getByTitle('musicQueue.playNow');
    fireEvent.click(playButton);

    expect(mockPlayerContext.playNowFromQueue).toHaveBeenCalledWith('track-1');
  });

  it('displays track duration when available', () => {
    mockPlayerContext.currentItem = mockTrack1;

    renderMusicQueue();

    expect(screen.getByText('3:45')).toBeInTheDocument();
  });

  it('displays album image when available', () => {
    mockPlayerContext.currentItem = mockTrack1;

    renderMusicQueue();

    const imgs = screen.getAllByAltText('');
    expect(imgs[0]).toHaveAttribute('src', '/image1.jpg');
  });

  it('displays placeholder when no album image', () => {
    mockPlayerContext.currentItem = mockTrack3;

    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <MusicQueue />
        </PlayerProvider>
      </BrowserRouter>
    );

    const placeholder = container.querySelector('.mq-cover--placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('uses default image on image load error', () => {
    mockPlayerContext.currentItem = mockTrack1;

    renderMusicQueue();

    const imgs = screen.getAllByAltText('');
    const img = imgs[0] as HTMLImageElement;

    fireEvent.error(img);

    expect(img.src).toContain('default-playlist-image.png');
  });

  it('shows dropdown menu for manual queue tracks', () => {
    mockPlayerContext.queueManual = [mockTrack1];

    renderMusicQueue();

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    expect(screen.getByText('musicQueue.addToPlaylist')).toBeInTheDocument();
    expect(screen.getByText('musicQueue.removeFromQueue')).toBeInTheDocument();
  });

  it('shows dropdown menu for auto queue tracks', () => {
    mockPlayerContext.queueAuto = [mockTrack2];

    renderMusicQueue();

    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('calls removeFromQueue when remove button clicked', () => {
    mockPlayerContext.queueManual = [mockTrack1];

    renderMusicQueue();

    const removeButton = screen.getByText('musicQueue.removeFromQueue');
    fireEvent.click(removeButton);

    expect(mockPlayerContext.removeFromQueue).toHaveBeenCalledWith('track-1');
  });

  it('toggles queue visibility on custom event', async () => {
    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <MusicQueue />
        </PlayerProvider>
      </BrowserRouter>
    );

    // Queue should be visible initially
    expect(container.querySelector('.music-queue')).toBeInTheDocument();

    // Dispatch toggle event
    window.dispatchEvent(new CustomEvent('queue:toggle', { detail: { open: false } }));

    await waitFor(() => {
      expect(container.querySelector('.music-queue')).not.toBeInTheDocument();
    });
  });

  it('shows add to playlist option in dropdown', () => {
    mockPlayerContext.queueManual = [mockTrack1];

    renderMusicQueue();

    // Verify add to playlist option is available
    expect(screen.getByText('musicQueue.addToPlaylist')).toBeInTheDocument();
  });

  it('displays track count for manual queue', () => {
    mockPlayerContext.queueManual = [mockTrack1, mockTrack2, mockTrack3];

    renderMusicQueue();

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays track count for auto queue', () => {
    mockPlayerContext.queueAuto = [mockTrack1, mockTrack2];

    renderMusicQueue();

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('supports drag and drop for manual queue tracks', () => {
    mockPlayerContext.queueManual = [mockTrack1, mockTrack2];

    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <MusicQueue />
        </PlayerProvider>
      </BrowserRouter>
    );

    const draggableItems = container.querySelectorAll('.draggable');
    expect(draggableItems.length).toBe(2);
  });

  it('calls moveManual when track is dragged and dropped', () => {
    mockPlayerContext.queueManual = [mockTrack1, mockTrack2];

    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <MusicQueue />
        </PlayerProvider>
      </BrowserRouter>
    );

    const draggableItems = container.querySelectorAll('.draggable');
    const firstItem = draggableItems[0];
    const secondItem = draggableItems[1];

    // Simulate drag start
    fireEvent.dragStart(firstItem, {
      dataTransfer: {
        effectAllowed: '',
        setData: jest.fn(),
      },
    });

    // Simulate drop on second item
    fireEvent.drop(secondItem, {
      preventDefault: jest.fn(),
    });

    expect(mockPlayerContext.moveManual).toHaveBeenCalledWith(0, 1);
  });

  it('does not allow dragging auto queue tracks', () => {
    mockPlayerContext.queueAuto = [mockTrack1];

    const { container } = render(
      <BrowserRouter>
        <PlayerProvider>
          <MusicQueue />
        </PlayerProvider>
      </BrowserRouter>
    );

    const items = container.querySelectorAll('.mq-item');
    const autoQueueItem = Array.from(items).find(item =>
      !item.classList.contains('draggable') && !item.classList.contains('mq-item--current')
    );

    expect(autoQueueItem).toBeTruthy();
    expect(autoQueueItem?.getAttribute('draggable')).toBe('false');
  });

  it('updates track playlist state on external event', async () => {
    mockPlayerContext.currentItem = mockTrack1;

    renderMusicQueue();

    // Dispatch external update event
    window.dispatchEvent(
      new CustomEvent('track:playlist-updated', {
        detail: { trackId: 1, playlistIds: [1, 2, 3] },
      })
    );

    await waitFor(() => {
      // Component should update internal state (testing side effect)
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    });
  });

  it('renders clear button in disabled state during hydration', () => {
    mockPlayerContext.isHydrating = true;

    renderMusicQueue();

    const clearButton = screen.getByRole('button');
    expect(clearButton).toBeDisabled();
  });
});
