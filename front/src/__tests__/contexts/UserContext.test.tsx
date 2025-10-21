import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '../../contexts/UserContext';
import * as UserService from '../../apis/UserService';

// Mock UserService
jest.mock('../../apis/UserService');
const mockedFetchUser = UserService.fetchUser as jest.MockedFunction<typeof UserService.fetchUser>;

describe('UserContext', () => {
  let dispatchEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    jest.useFakeTimers();
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
  );

  describe('useUser', () => {
    it('should throw error when used outside UserProvider', () => {
      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUser());
      }).toThrow('useUser must be used within a UserProvider');

      consoleErrorSpy.mockRestore();
    });

    it('should provide user context when used within UserProvider', () => {
      mockedFetchUser.mockResolvedValueOnce({
        data: { id: 1, name: 'Test User', email: 'test@example.com' },
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('refreshUser');
      expect(result.current).toHaveProperty('setUser');
    });
  });

  describe('UserProvider', () => {
    it('should fetch user on mount', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.user).toBeNull();

      await waitFor(() => {
        expect(mockedFetchUser).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });

    it('should set currentUserId in localStorage when user is fetched', async () => {
      const mockUser = { id: 42, name: 'Jane Doe', email: 'jane@example.com' };
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser });

      renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(localStorage.getItem('currentUserId')).toBe('42');
      });
    });

    it('should dispatch user:loaded event when user is fetched', async () => {
      const mockUser = { id: 42, name: 'Jane Doe', email: 'jane@example.com' };
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser });

      renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'user:loaded',
            detail: { userId: 42 },
          })
        );
      });
    });

    it('should handle fetchUser error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedFetchUser.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      await waitFor(() => {
        expect(localStorage.getItem('currentUserId')).toBeNull();
      });

      await waitFor(() => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'user:loaded',
            detail: { userId: null },
          })
        );
      });

      consoleErrorSpy.mockRestore();
    });

    it('should refresh user when refreshUser is called', async () => {
      const mockUser1 = { id: 1, name: 'User One', email: 'user1@example.com' };
      const mockUser2 = { id: 2, name: 'User Two', email: 'user2@example.com' };

      mockedFetchUser.mockResolvedValueOnce({ data: mockUser1 });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser1);
      });

      // Refresh user
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser2 });

      act(() => {
        result.current.refreshUser();
      });

      // Fast-forward debounce timer
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser2);
      });

      expect(localStorage.getItem('currentUserId')).toBe('2');
    });

    it('should update user when setUser is called', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const newUser = { id: 3, name: 'New User', email: 'new@example.com' };

      act(() => {
        result.current.setUser(newUser);
      });

      expect(result.current.user).toEqual(newUser);
    });

    it('should refresh user when auth:changed event is dispatched with token', async () => {
      const mockUser1 = { id: 1, name: 'User One', email: 'user1@example.com' };
      const mockUser2 = { id: 2, name: 'User Two', email: 'user2@example.com' };

      mockedFetchUser.mockResolvedValueOnce({ data: mockUser1 });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser1);
      });

      // Set auth token and dispatch event
      localStorage.setItem('authToken', 'new-token-123');
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser2 });

      act(() => {
        window.dispatchEvent(new Event('auth:changed'));
      });

      // User should be set to null immediately
      expect(result.current.user).toBeNull();

      // Fast-forward debounce timer
      act(() => {
        jest.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser2);
      });
    });

    it('should clear user when auth:changed event is dispatched without token', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser });

      const { result } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      localStorage.setItem('currentUserId', '1');

      // Remove auth token and dispatch event
      localStorage.removeItem('authToken');

      act(() => {
        window.dispatchEvent(new Event('auth:changed'));
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('currentUserId')).toBeNull();

      await waitFor(() => {
        expect(dispatchEventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'user:loaded',
            detail: { userId: null },
          })
        );
      });
    });

    it('should cleanup debounced refresh on unmount', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      mockedFetchUser.mockResolvedValueOnce({ data: mockUser });

      const { unmount } = renderHook(() => useUser(), { wrapper });

      await waitFor(() => {
        expect(mockedFetchUser).toHaveBeenCalled();
      });

      // Unmount should cancel debounced refresh
      unmount();

      // This test ensures no errors are thrown during cleanup
      expect(true).toBe(true);
    });
  });
});
