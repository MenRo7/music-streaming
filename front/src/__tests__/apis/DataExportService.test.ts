import api from '../../apis/api';
import { requestDataExport, getExportedData } from '../../apis/DataExportService';

jest.mock('../../apis/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('DataExportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestDataExport', () => {
    it('should request data export successfully', async () => {
      const mockResponse = {
        data: { message: 'Export initiated', token: 'test-token' },
      };
      mockedApi.post.mockResolvedValue(mockResponse);

      const result = await requestDataExport();

      expect(mockedApi.post).toHaveBeenCalledWith('/account/data/export');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle request data export error', async () => {
      const mockError = new Error('Export failed');
      mockedApi.post.mockRejectedValue(mockError);

      await expect(requestDataExport()).rejects.toThrow('Export failed');
    });
  });

  describe('getExportedData', () => {
    it('should get exported data successfully', async () => {
      const token = 'test-token';
      const mockResponse = {
        data: {
          user: { id: 1, name: 'Test User' },
          playlists: [],
          favorites: [],
        },
      };
      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await getExportedData(token);

      expect(mockedApi.get).toHaveBeenCalledWith(`/account/data/download/${token}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle get exported data error', async () => {
      const token = 'test-token';
      const mockError = new Error('Download failed');
      mockedApi.get.mockRejectedValue(mockError);

      await expect(getExportedData(token)).rejects.toThrow('Download failed');
    });
  });
});
