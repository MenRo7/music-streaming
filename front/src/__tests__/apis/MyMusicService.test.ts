import axios from 'axios';
import {
  getUserMusics,
  deleteMusic,
  getUserAlbums,
  deleteAlbum,
  updateAlbum,
} from '../../apis/MyMusicService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MyMusicService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserMusics', () => {
    it('should get user musics successfully', async () => {
      const mockResponse = {
        data: [
          { id: 1, name: 'Song 1' },
          { id: 2, name: 'Song 2' },
        ],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getUserMusics();

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get user musics error', async () => {
      const mockError = new Error('Failed to get musics');
      mockedAxios.get.mockRejectedValue(mockError);

      await expect(getUserMusics()).rejects.toThrow();
    });
  });

  describe('deleteMusic', () => {
    it('should delete music successfully', async () => {
      const musicId = 1;
      const mockResponse = { data: { message: 'Music deleted' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await deleteMusic(musicId);

      expect(mockedAxios.delete).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle delete music error', async () => {
      const musicId = 1;
      const mockError = new Error('Failed to delete music');
      mockedAxios.delete.mockRejectedValue(mockError);

      await expect(deleteMusic(musicId)).rejects.toThrow();
    });
  });

  describe('getUserAlbums', () => {
    it('should get user albums successfully', async () => {
      const mockResponse = {
        data: [
          { id: 1, title: 'Album 1' },
          { id: 2, title: 'Album 2' },
        ],
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await getUserAlbums();

      expect(mockedAxios.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get user albums error', async () => {
      const mockError = new Error('Failed to get albums');
      mockedAxios.get.mockRejectedValue(mockError);

      await expect(getUserAlbums()).rejects.toThrow();
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album successfully', async () => {
      const albumId = 1;
      const mockResponse = { data: { message: 'Album deleted' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await deleteAlbum(albumId);

      expect(mockedAxios.delete).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle delete album error', async () => {
      const albumId = 1;
      const mockError = new Error('Failed to delete album');
      mockedAxios.delete.mockRejectedValue(mockError);

      await expect(deleteAlbum(albumId)).rejects.toThrow();
    });
  });

  describe('updateAlbum', () => {
    it('should update album successfully', async () => {
      const albumId = 1;
      const albumData = { title: 'Updated Album', artist_name: 'Artist' };
      const mockResponse = { data: { id: albumId, ...albumData } };
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await updateAlbum(albumId, albumData);

      expect(mockedAxios.put).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle update album error', async () => {
      const albumId = 1;
      const albumData = { title: 'Updated Album' };
      const mockError = new Error('Failed to update album');
      mockedAxios.put.mockRejectedValue(mockError);

      await expect(updateAlbum(albumId, albumData)).rejects.toThrow();
    });
  });
});
