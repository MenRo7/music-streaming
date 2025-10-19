import axios from 'axios';
import {
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addTrackToAlbum,
  updateTrack,
  deleteTrack,
  likeAlbum,
  unlikeAlbum,
  Album,
} from '../../apis/AlbumService';
import { API_URL } from '../../apis/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios> & {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
};

// Mock fetch
global.fetch = jest.fn();

describe('AlbumService', () => {
  let dispatchEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
  });

  describe('getAlbumById', () => {
    it('should fetch album by ID with auth token', async () => {
      const mockAlbum: Album = {
        id: 1,
        title: 'Test Album',
        artist_name: 'Test Artist',
        musics: [],
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockAlbum });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await getAlbumById(1);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/album/1`, {
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
          Accept: 'application/json',
        }),
      });
      expect(result).toEqual(mockAlbum);
    });

    it('should handle album not found error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Album not found'));

      await expect(getAlbumById(999)).rejects.toThrow('Album not found');
    });
  });

  describe('createAlbum', () => {
    it('should create album via fetch', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, title: 'New Album' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const formData = new FormData();
      formData.append('title', 'New Album');

      const result = await createAlbum(formData);

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/album`, {
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
          Accept: 'application/json',
        }),
        body: formData,
      });
      expect(result).toEqual({ id: 1, title: 'New Album' });
    });

    it('should handle create album error', async () => {
      const mockResponse = { ok: false, status: 500 };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const formData = new FormData();
      await expect(createAlbum(formData)).rejects.toThrow('Erreur création album');
    });
  });

  describe('updateAlbum', () => {
    it('should update album and dispatch library:changed event', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, title: 'Updated Album' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const formData = new FormData();
      formData.append('title', 'Updated Album');

      const result = await updateAlbum(1, formData);

      expect(formData.get('_method')).toBe('PUT');
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/album/1`, {
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
        body: formData,
      });
      expect(result).toEqual({ id: 1, title: 'Updated Album' });
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'library:changed' })
      );
    });

    it('should handle update error', async () => {
      const mockResponse = { ok: false };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const formData = new FormData();
      await expect(updateAlbum(1, formData)).rejects.toThrow('Erreur mise à jour album');
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album and dispatch events with deleted track IDs', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ deleted_track_ids: [1, 2, 3] }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await deleteAlbum(1);

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/album/1`, {
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      });
      expect(result).toEqual({ deleted_track_ids: [1, 2, 3] });

      // Should dispatch library:pruned with track IDs
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'library:pruned',
          detail: { trackIds: [1, 2, 3] },
        })
      );
      // Should dispatch library:changed
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'library:changed' })
      );
    });

    it('should handle delete without track IDs', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ message: 'Album deleted' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await deleteAlbum(1);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'library:changed' })
      );
    });
  });

  describe('addTrackToAlbum', () => {
    it('should add track to album and dispatch library:changed', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 10, title: 'New Track' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const formData = new FormData();
      formData.append('title', 'New Track');

      const result = await addTrackToAlbum(5, formData);

      expect(formData.get('album_id')).toBe('5');
      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/music`, {
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
        body: formData,
      });
      expect(result).toEqual({ id: 10, title: 'New Track' });
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'library:changed' })
      );
    });
  });

  describe('updateTrack', () => {
    it('should update track with _method PUT', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 1, title: 'Updated Track' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const formData = new FormData();
      formData.append('title', 'Updated Track');

      const result = await updateTrack(1, formData);

      expect(formData.get('_method')).toBe('PUT');
      expect(result).toEqual({ id: 1, title: 'Updated Track' });
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'library:changed' })
      );
    });
  });

  describe('deleteTrack', () => {
    it('should delete track and dispatch tracks:deleted and library:pruned events', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ deleted_track_ids: [5] }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await deleteTrack(5);

      expect(global.fetch).toHaveBeenCalledWith(`${API_URL}/music/5`, {
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      });
      expect(result).toEqual({ deleted_track_ids: [5] });

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tracks:deleted',
          detail: { ids: [5] },
        })
      );
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'library:pruned',
          detail: { trackIds: [5] },
        })
      );
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'library:changed' })
      );
    });

    it('should use trackId if no deleted_track_ids returned', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ message: 'Track deleted' }),
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse);

      await deleteTrack(7);

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'tracks:deleted',
          detail: { ids: [7] },
        })
      );
    });
  });

  describe('likeAlbum', () => {
    it('should like album and dispatch likes:changed event', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Album liked' } });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await likeAlbum(1);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/album/1/like`,
        {},
        {
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        }
      );
      expect(result).toEqual({ message: 'Album liked' });
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'likes:changed' })
      );
    });
  });

  describe('unlikeAlbum', () => {
    it('should unlike album and dispatch likes:changed event', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { message: 'Album unliked' } });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await unlikeAlbum(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith(`${API_URL}/album/1/like`, {
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123',
        }),
      });
      expect(result).toEqual({ message: 'Album unliked' });
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'likes:changed' })
      );
    });
  });
});
