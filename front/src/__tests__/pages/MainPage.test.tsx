import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainPage from '../../pages/MainPage';
import { PlayerProvider } from '../../contexts/PlayerContext';
import { UserProvider } from '../../contexts/UserContext';
import * as MusicService from '../../apis/MusicService';

// Mock des services
jest.mock('../../apis/MusicService');

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock des composants lourds
jest.mock('../../components/SongList', () => {
  return function MockSongList({ musics }: any) {
    return (
      <div data-testid="song-list">
        {musics?.map((music: any) => (
          <div key={music.id} data-testid={`song-${music.id}`}>
            {music.title}
          </div>
        ))}
      </div>
    );
  };
});

const mockMusics = [
  {
    id: 1,
    title: 'Test Song 1',
    artist: 'Test Artist 1',
    image: '/test-image-1.jpg',
    audio: '/test-audio-1.mp3',
  },
  {
    id: 2,
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    image: '/test-image-2.jpg',
    audio: '/test-audio-2.mp3',
  },
];

const renderMainPage = () => {
  return render(
    <BrowserRouter>
      <UserProvider>
        <PlayerProvider>
          <MainPage />
        </PlayerProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

describe('MainPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main page with title', () => {
    (MusicService.getAllMusic as jest.Mock).mockResolvedValue([]);

    renderMainPage();

    expect(screen.getByText('main.title')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    (MusicService.getAllMusic as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderMainPage();

    expect(screen.getByText('common.loading')).toBeInTheDocument();
  });

  it('fetches and displays music list', async () => {
    (MusicService.getAllMusic as jest.Mock).mockResolvedValue(mockMusics);

    renderMainPage();

    await waitFor(() => {
      expect(screen.getByTestId('song-list')).toBeInTheDocument();
    });

    expect(screen.getByTestId('song-1')).toBeInTheDocument();
    expect(screen.getByTestId('song-2')).toBeInTheDocument();
    expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    expect(screen.getByText('Test Song 2')).toBeInTheDocument();
  });

  it('displays error message when fetch fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (MusicService.getAllMusic as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    renderMainPage();

    await waitFor(() => {
      expect(screen.getByText('errors.fetchMusic')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('displays empty state when no music available', async () => {
    (MusicService.getAllMusic as jest.Mock).mockResolvedValue([]);

    renderMainPage();

    await waitFor(() => {
      expect(screen.getByText('main.noMusic')).toBeInTheDocument();
    });
  });

  it('calls getAllMusic on mount', async () => {
    (MusicService.getAllMusic as jest.Mock).mockResolvedValue([]);

    renderMainPage();

    await waitFor(() => {
      expect(MusicService.getAllMusic).toHaveBeenCalledTimes(1);
    });
  });

  it('hides loading state after data is loaded', async () => {
    (MusicService.getAllMusic as jest.Mock).mockResolvedValue(mockMusics);

    renderMainPage();

    expect(screen.getByText('common.loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('common.loading')).not.toBeInTheDocument();
    });
  });

  it('renders sort options', async () => {
    (MusicService.getAllMusic as jest.Mock).mockResolvedValue(mockMusics);

    renderMainPage();

    await waitFor(() => {
      expect(screen.getByText('main.sortBy')).toBeInTheDocument();
    });
  });

  it('renders filter options', async () => {
    (MusicService.getAllMusic as jest.Mock).mockResolvedValue(mockMusics);

    renderMainPage();

    await waitFor(() => {
      expect(screen.getByText('main.filterBy')).toBeInTheDocument();
    });
  });
});
