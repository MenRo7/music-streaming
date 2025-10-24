import api from '../../apis/api';
import { search } from '../../apis/GlobalSearchService';

jest.mock('../../apis/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('GlobalSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should search with query only', async () => {
      const mockResponse = {
        data: {
          musics: [],
          albums: [],
          artists: [],
          playlists: [],
        },
      };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await search('test query');

      expect(mockedApi.get).toHaveBeenCalledWith('/search', {
        params: { q: 'test query' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search with query and type filter', async () => {
      const mockResponse = {
        data: {
          musics: [{ id: 1, name: 'Test Song' }],
        },
      };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await search('test query', 'music');

      expect(mockedApi.get).toHaveBeenCalledWith('/search', {
        params: { q: 'test query', type: 'music' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search for albums', async () => {
      const mockResponse = {
        data: {
          albums: [{ id: 1, title: 'Test Album' }],
        },
      };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await search('album name', 'album');

      expect(mockedApi.get).toHaveBeenCalledWith('/search', {
        params: { q: 'album name', type: 'album' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search for artists', async () => {
      const mockResponse = {
        data: {
          artists: [{ id: 1, name: 'Test Artist' }],
        },
      };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await search('artist name', 'artist');

      expect(mockedApi.get).toHaveBeenCalledWith('/search', {
        params: { q: 'artist name', type: 'artist' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search for playlists', async () => {
      const mockResponse = {
        data: {
          playlists: [{ id: 1, title: 'Test Playlist' }],
        },
      };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await search('playlist name', 'playlist');

      expect(mockedApi.get).toHaveBeenCalledWith('/search', {
        params: { q: 'playlist name', type: 'playlist' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle search error', async () => {
      const mockError = new Error('Search failed');
      mockedApi.get.mockRejectedValue(mockError);

      await expect(search('test query')).rejects.toThrow('Search failed');
    });

    it('should handle empty query', async () => {
      const mockResponse = { data: { musics: [], albums: [], artists: [], playlists: [] } };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await search('');

      expect(mockedApi.get).toHaveBeenCalledWith('/search', {
        params: { q: '' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});
