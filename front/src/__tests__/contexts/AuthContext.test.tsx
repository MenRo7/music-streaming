import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../contexts/AuthContext';
import { loginRequest, verify2fa } from '../../apis/AuthService';
import axios from 'axios';

// Mock dependencies
jest.mock('../../apis/AuthService');
jest.mock('axios');

const mockedLoginRequest = loginRequest as jest.MockedFunction<typeof loginRequest>;
const mockedVerify2fa = verify2fa as jest.MockedFunction<typeof verify2fa>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AuthContext', () => {
  let dispatchEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    // Reset axios defaults
    mockedAxios.defaults = { headers: { common: {} } } as any;
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Initial State', () => {
    it('should initialize with null user and token from localStorage', () => {
      localStorage.setItem('authToken', 'existing-token-123');

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBe('existing-token-123');
    });

    it('should initialize with null token when localStorage is empty', () => {
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });
  });

  describe('login', () => {
    it('should return "ok" for successful login without 2FA', async () => {
      mockedLoginRequest.mockResolvedValueOnce({
        data: { status: 'ok', token: 'new-token' },
      } as any);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      let loginResult: string = '';
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toBe('ok');
      expect(mockedLoginRequest).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should return "2fa_required" when 2FA is needed', async () => {
      mockedLoginRequest.mockResolvedValueOnce({
        data: { status: '2fa_required' },
      } as any);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      let loginResult: string = '';
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toBe('2fa_required');
    });

    it('should return "verification_required" when email verification is needed', async () => {
      mockedLoginRequest.mockResolvedValueOnce({
        data: { status: 'verification_required' },
      } as any);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      let loginResult: string = '';
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult).toBe('verification_required');
    });

    it('should handle login errors', async () => {
      mockedLoginRequest.mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('confirm2fa', () => {
    it('should confirm 2FA and set token, user, and dispatch event', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const mockToken = 'auth-token-456';

      mockedVerify2fa.mockResolvedValueOnce({
        data: { token: mockToken, user: mockUser },
      } as any);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await act(async () => {
        await result.current.confirm2fa('john@example.com', 'ABC123');
      });

      // Check token is saved to localStorage
      expect(localStorage.getItem('authToken')).toBe(mockToken);

      // Check state is updated
      expect(result.current.token).toBe(mockToken);
      expect(result.current.user).toEqual(mockUser);

      // Check axios default header is set
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`);

      // Check auth:changed event is dispatched
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:changed' })
      );

      expect(mockedVerify2fa).toHaveBeenCalledWith('john@example.com', 'ABC123');
    });

    it('should handle 2FA verification errors', async () => {
      mockedVerify2fa.mockRejectedValueOnce(new Error('Invalid 2FA code'));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await expect(
        act(async () => {
          await result.current.confirm2fa('john@example.com', 'WRONG');
        })
      ).rejects.toThrow('Invalid 2FA code');
    });
  });

  describe('logout', () => {
    it('should logout successfully and clear all auth data', async () => {
      // Setup initial authenticated state
      localStorage.setItem('authToken', 'existing-token');
      mockedAxios.defaults.headers.common['Authorization'] = 'Bearer existing-token';

      mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Logged out' } } as any);

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      // Manually set user state (simulating logged in state)
      await act(async () => {
        // Trigger a state change to simulate logged-in state
        const mockUser = { id: 1, name: 'John' };
        const mockToken = 'existing-token';

        // Directly call logout
        await result.current.logout();
      });

      // Check localStorage is cleared
      expect(localStorage.getItem('authToken')).toBeNull();

      // Check state is cleared
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();

      // Check axios default header is removed
      expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();

      // Check auth:changed event is dispatched
      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'auth:changed' })
      );

      // Check logout API was called
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/logout'),
        {},
        expect.objectContaining({
          withCredentials: true,
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      );
    });

    it('should clear auth data even if logout API call fails', async () => {
      localStorage.setItem('authToken', 'token-to-remove');
      mockedAxios.defaults.headers.common['Authorization'] = 'Bearer token-to-remove';

      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear auth data despite API error
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('Context Provider', () => {
    it('should provide all context values', () => {
      const { result } = renderHook(() => React.useContext(AuthContext), { wrapper });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('token');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('confirm2fa');
      expect(result.current).toHaveProperty('logout');

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.confirm2fa).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });
  });
});
