import axios from 'axios';
import {
  fetchUser,
  subscribeToUser,
  unsubscribeFromUser,
  updateUserProfile,
  requestEmailChange,
  confirmEmailChange,
  changePassword,
} from '../../apis/UserService';
import { API_URL } from '../../apis/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('fetchUser', () => {
    it('should fetch current user data with auth token', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

      localStorage.setItem('authToken', 'test-token-123');
      const result = await fetchUser();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_URL}/user`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            Accept: 'application/json',
          }),
        })
      );
      expect(result).toEqual({ data: mockUser });
    });

    it('should fetch user without auth token', async () => {
      const mockUser = { id: 1, name: 'Guest' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockUser });

      const result = await fetchUser();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_URL}/user`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        })
      );
    });
  });

  describe('subscribeToUser', () => {
    it('should subscribe to a user', async () => {
      const mockResponse = { data: { message: 'User subscribed' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await subscribeToUser(5);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/users/5/subscribe`,
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual({ message: 'User subscribed' });
    });
  });

  describe('unsubscribeFromUser', () => {
    it('should unsubscribe from a user', async () => {
      const mockResponse = { data: { message: 'User unsubscribed' } };
      mockedAxios.delete.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await unsubscribeFromUser(5);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_URL}/users/5/subscribe`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual({ message: 'User unsubscribed' });
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      const mockResponse = { data: { id: 1, name: 'Updated Name' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const formData = new FormData();
      formData.append('name', 'Updated Name');

      const result = await updateUserProfile(formData);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/user/update`, formData, {
        headers: {
          Authorization: 'Bearer test-token-123',
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('requestEmailChange', () => {
    it('should request email change', async () => {
      const mockResponse = { data: { message: 'Verification email sent' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await requestEmailChange('newemail@example.com', 'currentpass');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/account/email/change/request`,
        { new_email: 'newemail@example.com', current_password: 'currentpass' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('confirmEmailChange', () => {
    it('should confirm email change with token', async () => {
      const mockResponse = { data: { message: 'Email changed successfully' } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await confirmEmailChange('verification-token-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_URL}/account/email/change/confirm?token=verification-token-123`
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const mockResponse = { data: { message: 'Password changed' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      localStorage.setItem('authToken', 'test-token-123');
      const result = await changePassword('oldpass', 'newpass');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/account/password/change`,
        {
          current_password: 'oldpass',
          new_password: 'newpass',
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
