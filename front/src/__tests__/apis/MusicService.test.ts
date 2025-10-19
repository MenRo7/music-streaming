import axios from 'axios';
import { createMusic, checkTracksExist } from '../../apis/MusicService';
import { API_URL } from '../../apis/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock fetch
global.fetch = jest.fn();

describe('MusicService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('createMusic', () => {
    it('should create music with FormData and auth token', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Song' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const formData = new FormData();
      formData.append('title', 'Test Song');
      formData.append('audio', new Blob(['audio'], { type: 'audio/mp3' }));

      const result = await createMusic(formData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/music`,
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      expect(result).toEqual({ id: 1, title: 'Test Song' });
    });

    it('should create music without auth token', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Song' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const formData = new FormData();
      formData.append('title', 'Test Song');

      const result = await createMusic(formData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/music`,
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      expect(result).toEqual({ id: 1, title: 'Test Song' });
    });

    it('should handle music creation error', async () => {
      const mockError = new Error('Failed to create music');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      const formData = new FormData();
      formData.append('title', 'Test Song');

      await expect(createMusic(formData)).rejects.toThrow('Failed to create music');
    });

    it('should clean token with quotes', async () => {
      const mockResponse = { data: { id: 1, title: 'Test Song' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', '"quoted-token-123"');
      const formData = new FormData();

      await createMusic(formData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/music`,
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer quoted-token-123',
          }),
        })
      );
    });
  });

  describe('checkTracksExist', () => {
    it('should check if tracks exist with valid IDs', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ exists: [1, 3, 5] }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const ids = [1, 2, 3, 4, 5];

      const result = await checkTracksExist(ids);

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/music/exists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer test-token-123',
        },
        body: JSON.stringify({ ids }),
      });
      expect(result).toEqual([1, 3, 5]);
    });

    it('should work without auth token', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ exists: [1, 2] }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const ids = [1, 2, 3];
      const result = await checkTracksExist(ids);

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/music/exists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ ids }),
      });
      expect(result).toEqual([1, 2]);
    });

    it('should handle empty exists array', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ exists: [] }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await checkTracksExist([999, 888]);

      expect(result).toEqual([]);
    });

    it('should handle invalid response format', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ exists: null }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await checkTracksExist([1, 2]);

      expect(result).toEqual([]);
    });

    it('should handle fetch error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await expect(checkTracksExist([1, 2, 3])).rejects.toThrow(
        'checkTracksExist failed'
      );
    });

    it('should handle network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(checkTracksExist([1, 2])).rejects.toThrow('Network error');
    });

    it('should convert string IDs to numbers', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ exists: ['1', '2', '3'] }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await checkTracksExist([1, 2, 3]);

      expect(result).toEqual([1, 2, 3]);
      expect(result.every((id) => typeof id === 'number')).toBe(true);
    });
  });
});
