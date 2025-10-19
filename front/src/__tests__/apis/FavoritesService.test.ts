import axios from 'axios';
import { getFavorites, addFavorite, removeFavorite } from '../../apis/FavoritesService';
import { API_URL } from '../../apis/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FavoritesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('getFavorites', () => {
    it('should fetch all favorites with auth token', async () => {
      const mockFavorites = [
        { id: 1, title: 'Song 1', artist: 'Artist 1' },
        { id: 2, title: 'Song 2', artist: 'Artist 2' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockFavorites });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await getFavorites();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/favorites`, {
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
          Accept: 'application/json',
        }),
      });
      expect(result).toEqual(mockFavorites);
    });

    it('should fetch favorites without auth token', async () => {
      const mockFavorites = [];
      mockedAxios.get.mockResolvedValueOnce({ data: mockFavorites });

      const result = await getFavorites();

      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/favorites`, {
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      });
      expect(result).toEqual(mockFavorites);
    });

    it('should handle fetch favorites error', async () => {
      const mockError = new Error('Unauthorized');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      await expect(getFavorites()).rejects.toThrow('Unauthorized');
    });
  });

  describe('addFavorite', () => {
    it('should add music to favorites with auth token', async () => {
      const mockResponse = { data: { message: 'Added to favorites' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await addFavorite(5);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/favorites/5`,
        {},
        {
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            Accept: 'application/json',
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should add favorite without auth token', async () => {
      const mockResponse = { data: { message: 'Added to favorites' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await addFavorite(5);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/favorites/5`,
        {},
        {
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle add favorite error', async () => {
      const mockError = new Error('Already in favorites');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(addFavorite(5)).rejects.toThrow('Already in favorites');
    });

    it('should clean token with quotes', async () => {
      const mockResponse = { data: { message: 'Added to favorites' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', '"quoted-token-456"');
      await addFavorite(10);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/favorites/10`,
        {},
        {
          headers: expect.objectContaining({
            Authorization: 'Bearer quoted-token-456',
          }),
        }
      );
    });
  });

  describe('removeFavorite', () => {
    it('should remove music from favorites with auth token', async () => {
      const mockResponse = { data: { message: 'Removed from favorites' } };
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await removeFavorite(5);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`${API_URL}/favorites/5`, {
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
          Accept: 'application/json',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should remove favorite without auth token', async () => {
      const mockResponse = { data: { message: 'Removed from favorites' } };
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await removeFavorite(5);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`${API_URL}/favorites/5`, {
        headers: expect.objectContaining({
          Accept: 'application/json',
        }),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle remove favorite error', async () => {
      const mockError = new Error('Not in favorites');
      mockedAxios.delete.mockRejectedValueOnce(mockError);

      await expect(removeFavorite(5)).rejects.toThrow('Not in favorites');
    });

    it('should handle network error', async () => {
      const mockError = new Error('Network error');
      mockedAxios.delete.mockRejectedValueOnce(mockError);

      await expect(removeFavorite(1)).rejects.toThrow('Network error');
    });
  });
});
