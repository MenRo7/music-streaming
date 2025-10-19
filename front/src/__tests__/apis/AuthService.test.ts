import axios from 'axios';
import {
  registerUser,
  verifyEmail,
  resendEmailCode,
  loginRequest,
  verify2fa,
  resend2fa,
  forgotPassword,
  resetPassword,
} from '../../apis/AuthService';
import { API_URL } from '../../apis/api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user with valid credentials', async () => {
      const mockResponse = { data: { message: 'User registered successfully' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const name = 'John Doe';
      const email = 'john@example.com';
      const password = 'SecurePassword123!';
      const date_of_birth = '1990-01-01';

      const response = await registerUser(name, email, password, date_of_birth);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/register`, {
        name,
        email,
        password,
        date_of_birth,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle registration error', async () => {
      const mockError = new Error('Email already exists');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        registerUser('John Doe', 'existing@example.com', 'password', '1990-01-01')
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with correct code', async () => {
      const mockResponse = { data: { message: 'Email verified' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const email = 'john@example.com';
      const code = 'ABC123';

      const response = await verifyEmail(email, code);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/verify-email`, {
        email,
        code,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle invalid verification code', async () => {
      const mockError = new Error('Invalid verification code');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(verifyEmail('john@example.com', 'WRONG')).rejects.toThrow(
        'Invalid verification code'
      );
    });
  });

  describe('resendEmailCode', () => {
    it('should resend email verification code', async () => {
      const mockResponse = { data: { message: 'Code resent' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const email = 'john@example.com';
      const response = await resendEmailCode(email);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/resend-email-code`, {
        email,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle resend code error', async () => {
      const mockError = new Error('Too many requests');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(resendEmailCode('john@example.com')).rejects.toThrow(
        'Too many requests'
      );
    });
  });

  describe('loginRequest', () => {
    it('should send login request with credentials and withCredentials option', async () => {
      const mockResponse = { data: { requires2fa: true } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const email = 'john@example.com';
      const password = 'SecurePassword123!';

      const response = await loginRequest(email, password);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      expect(response).toEqual(mockResponse);
    });

    it('should handle invalid login credentials', async () => {
      const mockError = new Error('Invalid credentials');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(loginRequest('john@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('verify2fa', () => {
    it('should verify 2FA code successfully', async () => {
      const mockResponse = { data: { token: 'auth-token-123', user: { id: 1 } } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const email = 'john@example.com';
      const code = 'ABC123';

      const response = await verify2fa(email, code);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/login/verify`, {
        email,
        code,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle invalid 2FA code', async () => {
      const mockError = new Error('Invalid 2FA code');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(verify2fa('john@example.com', 'WRONG')).rejects.toThrow(
        'Invalid 2FA code'
      );
    });
  });

  describe('resend2fa', () => {
    it('should resend 2FA code', async () => {
      const mockResponse = { data: { message: '2FA code resent' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const email = 'john@example.com';
      const response = await resend2fa(email);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/login/resend`, {
        email,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle resend 2FA error', async () => {
      const mockError = new Error('Rate limit exceeded');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(resend2fa('john@example.com')).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset request', async () => {
      const mockResponse = { data: { message: 'Reset code sent' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const email = 'john@example.com';
      const response = await forgotPassword(email);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/password/forgot`, {
        email,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle forgot password error', async () => {
      const mockError = new Error('User not found');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(forgotPassword('nonexistent@example.com')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid code and matching passwords', async () => {
      const mockResponse = { data: { message: 'Password reset successfully' } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const email = 'john@example.com';
      const code = 'RESET123';
      const password = 'NewSecurePassword123!';
      const password_confirmation = 'NewSecurePassword123!';

      const response = await resetPassword(email, code, password, password_confirmation);

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_URL}/password/reset`, {
        email,
        code,
        password,
        password_confirmation,
      });
      expect(response).toEqual(mockResponse);
    });

    it('should handle invalid reset code', async () => {
      const mockError = new Error('Invalid or expired reset code');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        resetPassword('john@example.com', 'INVALID', 'newpass', 'newpass')
      ).rejects.toThrow('Invalid or expired reset code');
    });

    it('should handle password mismatch', async () => {
      const mockError = new Error('Passwords do not match');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(
        resetPassword('john@example.com', 'RESET123', 'password1', 'password2')
      ).rejects.toThrow('Passwords do not match');
    });
  });
});
