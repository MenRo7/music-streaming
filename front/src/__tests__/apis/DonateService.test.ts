import axios, { AxiosInstance } from 'axios';
import { createDonationCheckoutSession } from '../../apis/DonateService';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create a mock instance
const mockAxiosInstance = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
} as any as jest.Mocked<AxiosInstance>;

// Make axios.create return our mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance);

describe('DonateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Ensure axios.create always returns our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
  });

  describe('createDonationCheckoutSession', () => {
    it('should create donation checkout session with default currency', async () => {
      const mockResponse = { data: { id: 'session-123' } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');

      const result = await createDonationCheckoutSession(5, 1000);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/users/5/donate/checkout',
        {
          amount_cents: 1000,
          currency: 'eur',
        },
        {
          headers: { Authorization: 'Bearer test-token-123' },
        }
      );
      expect(result).toEqual({ id: 'session-123' });
    });

    it('should create donation checkout session with custom currency', async () => {
      const mockResponse = { data: { id: 'session-456' } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');

      const result = await createDonationCheckoutSession(10, 2000, 'usd');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/users/10/donate/checkout',
        {
          amount_cents: 2000,
          currency: 'usd',
        },
        {
          headers: { Authorization: 'Bearer test-token-123' },
        }
      );
      expect(result).toEqual({ id: 'session-456' });
    });

    it('should handle donation checkout error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(new Error('Payment failed'));

      localStorage.setItem('authToken', 'test-token-123');

      await expect(createDonationCheckoutSession(5, 1000)).rejects.toThrow('Payment failed');
    });

    it('should send request without token if not authenticated', async () => {
      const mockResponse = { data: { id: 'session-789' } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      const result = await createDonationCheckoutSession(5, 1500);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/users/5/donate/checkout',
        {
          amount_cents: 1500,
          currency: 'eur',
        },
        {
          headers: { Authorization: 'Bearer null' },
        }
      );
    });
  });
});
