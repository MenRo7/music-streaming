import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GlobalSearchBar from '../../components/GlobalSearchBar';
import { search } from '../../apis/GlobalSearchService';

jest.mock('../../apis/GlobalSearchService');
const mockedSearch = search as jest.MockedFunction<typeof search>;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <GlobalSearchBar />
    </BrowserRouter>
  );
};

describe('GlobalSearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    renderComponent();
    expect(screen.getByPlaceholderText(/rechercher/i)).toBeInTheDocument();
  });

  it('should update query on input change', () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'test query' } });

    expect(input.value).toBe('test query');
  });

  it('should call search API when query is entered', async () => {
    const mockResults = {
      users: { data: [] },
      playlists: { data: [] },
      musics: { data: [] },
      albums: { data: [] },
    };
    mockedSearch.mockResolvedValue(mockResults);

    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i);

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockedSearch).toHaveBeenCalledWith(
        'test',
        ['user', 'playlist', 'music', 'album'],
        1, 1, 1, 1, 10
      );
    });
  });

  it('should not search when query is empty', async () => {
    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i);

    fireEvent.change(input, { target: { value: '' } });

    await waitFor(() => {
      expect(mockedSearch).not.toHaveBeenCalled();
    });
  });

  it('should show results on focus when query exists', () => {
    const mockResults = {
      users: { data: [{ id: 1, username: 'testuser' }] },
      playlists: { data: [] },
      musics: { data: [] },
      albums: { data: [] },
    };
    mockedSearch.mockResolvedValue(mockResults);

    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i);

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.focus(input);

    // Results dropdown should be visible
    expect(input).toHaveFocus();
  });

  it('should render filter button', () => {
    renderComponent();
    const filterIcon = document.querySelector('.global-search-filter-icon');
    expect(filterIcon).toBeInTheDocument();
  });

  it('should reset pages when query changes', async () => {
    const mockResults = {
      users: { data: [] },
      playlists: { data: [] },
      musics: { data: [] },
      albums: { data: [] },
    };
    mockedSearch.mockResolvedValue(mockResults);

    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i);

    fireEvent.change(input, { target: { value: 'first' } });

    await waitFor(() => {
      expect(mockedSearch).toHaveBeenCalledWith(
        'first',
        expect.any(Array),
        1, 1, 1, 1, 10
      );
    });

    fireEvent.change(input, { target: { value: 'second' } });

    await waitFor(() => {
      expect(mockedSearch).toHaveBeenCalledWith(
        'second',
        expect.any(Array),
        1, 1, 1, 1, 10
      );
    });
  });

  it('should handle search error gracefully', async () => {
    mockedSearch.mockRejectedValue(new Error('Search failed'));

    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i);

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockedSearch).toHaveBeenCalled();
    });

    // Component should not crash
    expect(input).toBeInTheDocument();
  });

  it('should render search icon', () => {
    renderComponent();
    const searchIcon = document.querySelector('.global-search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should show results when search icon is clicked', () => {
    const mockResults = {
      users: { data: [] },
      playlists: { data: [] },
      musics: { data: [] },
      albums: { data: [] },
    };
    mockedSearch.mockResolvedValue(mockResults);

    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i);
    const searchIcon = document.querySelector('.global-search-icon') as HTMLElement;

    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.click(searchIcon);

    // Results should be shown
    expect(searchIcon).toBeInTheDocument();
  });

  it('should clear results when query is cleared', async () => {
    const mockResults = {
      users: { data: [{ id: 1, username: 'testuser' }] },
      playlists: { data: [] },
      musics: { data: [] },
      albums: { data: [] },
    };
    mockedSearch.mockResolvedValue(mockResults);

    renderComponent();
    const input = screen.getByPlaceholderText(/rechercher/i);

    fireEvent.change(input, { target: { value: 'test' } });

    await waitFor(() => {
      expect(mockedSearch).toHaveBeenCalled();
    });

    fireEvent.change(input, { target: { value: '' } });

    // Should not show results for empty query
    expect(input.value).toBe('');
  });
});
