import api from '../../apis/api';
import {
  getUserMusics,
  deleteMusic,
  getUserAlbums,
  deleteAlbum,
  updateAlbum,
} from '../../apis/MyMusicService';

jest.mock('../../apis/api');
const mockedApi = api as jest.Mocked<typeof api>;

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
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await getUserMusics();

      expect(mockedApi.get).toHaveBeenCalledWith('/my-music');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get user musics error', async () => {
      const mockError = new Error('Failed to get musics');
      mockedApi.get.mockRejectedValue(mockError);

      await expect(getUserMusics()).rejects.toThrow('Failed to get musics');
    });
  });

  describe('deleteMusic', () => {
    it('should delete music successfully', async () => {
      const musicId = 1;
      const mockResponse = { data: { message: 'Music deleted' } };
      mockedApi.delete.mockResolvedValue(mockResponse);

      const result = await deleteMusic(musicId);

      expect(mockedApi.delete).toHaveBeenCalledWith(`/music/${musicId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle delete music error', async () => {
      const musicId = 1;
      const mockError = new Error('Failed to delete music');
      mockedApi.delete.mockRejectedValue(mockError);

      await expect(deleteMusic(musicId)).rejects.toThrow('Failed to delete music');
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
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await getUserAlbums();

      expect(mockedApi.get).toHaveBeenCalledWith('/my-albums');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get user albums error', async () => {
      const mockError = new Error('Failed to get albums');
      mockedApi.get.mockRejectedValue(mockError);

      await expect(getUserAlbums()).rejects.toThrow('Failed to get albums');
    });
  });

  describe('deleteAlbum', () => {
    it('should delete album successfully', async () => {
      const albumId = 1;
      const mockResponse = { data: { message: 'Album deleted' } };
      mockedApi.delete.mockResolvedValue(mockResponse);

      const result = await deleteAlbum(albumId);

      expect(mockedApi.delete).toHaveBeenCalledWith(`/album/${albumId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle delete album error', async () => {
      const albumId = 1;
      const mockError = new Error('Failed to delete album');
      mockedApi.delete.mockRejectedValue(mockError);

      await expect(deleteAlbum(albumId)).rejects.toThrow('Failed to delete album');
    });
  });

  describe('updateAlbum', () => {
    it('should update album successfully', async () => {
      const albumId = 1;
      const albumData = { title: 'Updated Album', artist_name: 'Artist' };
      const mockResponse = { data: { id: albumId, ...albumData } };
      mockedApi.put.mockResolvedValue(mockResponse);

      const result = await updateAlbum(albumId, albumData);

      expect(mockedApi.put).toHaveBeenCalledWith(`/album/${albumId}`, albumData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle update album error', async () => {
      const albumId = 1;
      const albumData = { title: 'Updated Album' };
      const mockError = new Error('Failed to update album');
      mockedApi.put.mockRejectedValue(mockError);

      await expect(updateAlbum(albumId, albumData)).rejects.toThrow('Failed to update album');
    });
  });
});
