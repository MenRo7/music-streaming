import axios from 'axios';
import {
  getPlaylistById,
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addMusicToPlaylist,
  removeMusicFromPlaylist,
  likePlaylist,
  unlikePlaylist,
} from '../../apis/PlaylistService';
import { API_URL } from '../../apis/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PlaylistService', () => {
  let dispatchEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
  });

  describe('getPlaylistById', () => {
    it('should fetch playlist by ID with auth token', async () => {
      const mockPlaylist = { id: 1, title: 'My Playlist', songs: [] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPlaylist });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await getPlaylistById(1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_URL}/playlists/1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            Accept: 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockPlaylist);
    });

    it('should fetch playlist without auth token', async () => {
      const mockPlaylist = { id: 1, title: 'Public Playlist' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockPlaylist });

      const result = await getPlaylistById(1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_URL}/playlists/1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockPlaylist);
    });

    it('should handle playlist not found error', async () => {
      const mockError = new Error('Playlist not found');
      mockedAxios.get.mockRejectedValueOnce(mockError);

      await expect(getPlaylistById(999)).rejects.toThrow('Playlist not found');
    });
  });

  describe('getPlaylists', () => {
    it('should fetch all playlists with auth token', async () => {
      const mockPlaylists = [
        { id: 1, title: 'Playlist 1' },
        { id: 2, title: 'Playlist 2' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPlaylists });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await getPlaylists();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_URL}/playlists`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockPlaylists);
    });

    it('should return empty array without auth token', async () => {
      const result = await getPlaylists();

      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('createPlaylist', () => {
    it('should create playlist and dispatch events', async () => {
      const mockResponse = { id: 1, title: 'New Playlist' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      localStorage.setItem('authToken', 'test-token-123');
      const formData = new FormData();
      formData.append('title', 'New Playlist');

      const result = await createPlaylist(formData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/playlists`,
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
      expect(dispatchEventSpy).toHaveBeenCalledWith(expect.any(Event));
      expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

      const events = dispatchEventSpy.mock.calls.map(call => call[0].type);
      expect(events).toContain('library:changed');
      expect(events).toContain('playlists:changed');
    });

    it('should handle create playlist error', async () => {
      const mockError = new Error('Failed to create playlist');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      const formData = new FormData();
      await expect(createPlaylist(formData)).rejects.toThrow('Failed to create playlist');
    });
  });

  describe('updatePlaylist', () => {
    it('should update playlist with _method PUT and dispatch events', async () => {
      const mockResponse = { id: 1, title: 'Updated Playlist' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      localStorage.setItem('authToken', 'test-token-123');
      const formData = new FormData();
      formData.append('title', 'Updated Playlist');

      const result = await updatePlaylist(1, formData);

      // Check that _method was appended
      expect(formData.get('_method')).toBe('PUT');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/playlists/1`,
        formData,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            'Content-Type': 'multipart/form-data',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('deletePlaylist', () => {
    it('should delete playlist and dispatch events', async () => {
      const mockResponse = { message: 'Playlist deleted' };
      mockedAxios.delete.mockResolvedValueOnce({ data: mockResponse });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await deletePlaylist(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_URL}/playlists/1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(2);

      const events = dispatchEventSpy.mock.calls.map(call => call[0].type);
      expect(events).toContain('library:changed');
      expect(events).toContain('playlists:changed');
    });

    it('should handle delete error', async () => {
      const mockError = new Error('Unauthorized');
      mockedAxios.delete.mockRejectedValueOnce(mockError);

      await expect(deletePlaylist(1)).rejects.toThrow('Unauthorized');
    });
  });

  describe('addMusicToPlaylist', () => {
    it('should add music to playlist', async () => {
      const mockResponse = { message: 'Music added' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await addMusicToPlaylist(1, 5);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/playlists/1/add-music`,
        { music_id: 5 },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle add music error', async () => {
      const mockError = new Error('Music already in playlist');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(addMusicToPlaylist(1, 5)).rejects.toThrow('Music already in playlist');
    });
  });

  describe('removeMusicFromPlaylist', () => {
    it('should remove music from playlist', async () => {
      const mockResponse = { message: 'Music removed' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await removeMusicFromPlaylist(1, 5);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/playlists/1/remove-music`,
        { music_id: 5 },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle remove music error', async () => {
      const mockError = new Error('Music not in playlist');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(removeMusicFromPlaylist(1, 5)).rejects.toThrow('Music not in playlist');
    });
  });

  describe('likePlaylist', () => {
    it('should like playlist and dispatch likes:changed event', async () => {
      const mockResponse = { message: 'Playlist liked' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await likePlaylist(1);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/playlists/1/like`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'likes:changed' })
      );
    });
  });

  describe('unlikePlaylist', () => {
    it('should unlike playlist and dispatch likes:changed event', async () => {
      const mockResponse = { message: 'Playlist unliked' };
      mockedAxios.delete.mockResolvedValueOnce({ data: mockResponse });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await unlikePlaylist(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_URL}/playlists/1/like`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'likes:changed' })
      );
    });
  });
});
