import api from '../../apis/api';
import { getPreferences, updatePreferences } from '../../apis/PreferencesService';

jest.mock('../../apis/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('PreferencesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPreferences', () => {
    it('should get user preferences successfully', async () => {
      const mockResponse = {
        data: {
          locale: 'fr',
          theme: 'dark',
          notifications: true,
        },
      };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await getPreferences();

      expect(mockedApi.get).toHaveBeenCalledWith('/preferences');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get preferences error', async () => {
      const mockError = new Error('Get preferences failed');
      mockedApi.get.mockRejectedValue(mockError);

      await expect(getPreferences()).rejects.toThrow('Get preferences failed');
    });
  });

  describe('updatePreferences', () => {
    it('should update locale preference', async () => {
      const preferences = { locale: 'en' };
      const mockResponse = {
        data: { locale: 'en', theme: 'dark', notifications: true },
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await updatePreferences(preferences);

      expect(mockedApi.post).toHaveBeenCalledWith('/preferences', preferences);
      expect(result).toEqual(mockResponse.data);
    });

    it('should update theme preference', async () => {
      const preferences = { theme: 'light' };
      const mockResponse = {
        data: { locale: 'fr', theme: 'light', notifications: true },
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await updatePreferences(preferences);

      expect(mockedApi.post).toHaveBeenCalledWith('/preferences', preferences);
      expect(result).toEqual(mockResponse.data);
    });

    it('should update multiple preferences', async () => {
      const preferences = { locale: 'es', theme: 'light', notifications: false };
      const mockResponse = { data: preferences };
      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await updatePreferences(preferences);

      expect(mockedApi.post).toHaveBeenCalledWith('/preferences', preferences);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle update preferences error', async () => {
      const preferences = { locale: 'en' };
      const mockError = new Error('Update preferences failed');
      mockedApi.post.mockRejectedValue(mockError);

      await expect(updatePreferences(preferences)).rejects.toThrow('Update preferences failed');
    });
  });
});
