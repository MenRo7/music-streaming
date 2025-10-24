import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { PlayerProvider, usePlayer } from '../../contexts/PlayerContext';
import type { Track } from '../../contexts/PlayerContext';

// Mock Analytics
jest.mock('../../utils/analytics', () => ({
  Analytics: {
    playTrack: jest.fn(),
    addToQueue: jest.fn(),
  },
}));

// Mock MusicService
jest.mock('../../apis/MusicService', () => ({
  checkTracksExist: jest.fn().mockResolvedValue([1, 2, 3]),
}));

describe('PlayerContext - Advanced Features', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PlayerProvider>{children}</PlayerProvider>
  );

  const mockTrack: Track = {
    id: 1,
    name: 'Test Track',
    artist: 'Test Artist',
    album: 'Test Album',
    album_image: '/test.jpg',
    audio: '/test.mp3',
    duration: 180,
  };

  const mockTrack2: Track = {
    id: 2,
    name: 'Track 2',
    artist: 'Artist 2',
    album: 'Album 2',
    album_image: '/test2.jpg',
    audio: '/test2.mp3',
    duration: 200,
  };

  describe('addToQueue', () => {
    it('should add a track to the manual queue', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockTrack);
      });

      expect(result.current.queueManual).toHaveLength(1);
      expect(result.current.queueManual[0]).toMatchObject({
        id: mockTrack.id,
        name: mockTrack.name,
        artist: mockTrack.artist,
        origin: 'manual',
      });
    });

    it('should add multiple tracks to queue', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockTrack);
        result.current.addToQueue(mockTrack2);
      });

      expect(result.current.queueManual).toHaveLength(2);
      expect(result.current.queueManual[0].id).toBe(mockTrack.id);
      expect(result.current.queueManual[1].id).toBe(mockTrack2.id);
    });

    it('should assign unique qid to each queued track', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockTrack);
        result.current.addToQueue(mockTrack); // Same track twice
      });

      const qids = result.current.queueManual.map(item => item.qid);
      expect(qids[0]).not.toBe(qids[1]);
      expect(qids[0]).toBeDefined();
      expect(qids[1]).toBeDefined();
    });
  });

  describe('clearQueue', () => {
    it('should clear manual and auto queues while keeping current track', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.playSong(
          mockTrack.audio,
          mockTrack.name,
          mockTrack.artist,
          mockTrack.album_image || '',
          mockTrack.id
        );
        result.current.addToQueue(mockTrack2);
      });

      expect(result.current.queueManual).toHaveLength(1);
      expect(result.current.currentTrackId).toBe(mockTrack.id);

      act(() => {
        result.current.clearQueue(true);
      });

      expect(result.current.queueManual).toHaveLength(0);
      expect(result.current.queueAuto).toHaveLength(0);
      expect(result.current.currentTrackId).toBe(mockTrack.id); // Current track kept
    });

    it('should clear everything including current track when keepCurrent is false', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.playSong(
          mockTrack.audio,
          mockTrack.name,
          mockTrack.artist,
          mockTrack.album_image || '',
          mockTrack.id
        );
        result.current.addToQueue(mockTrack2);
      });

      act(() => {
        result.current.clearQueue(false);
      });

      expect(result.current.queueManual).toHaveLength(0);
      expect(result.current.queueAuto).toHaveLength(0);
      expect(result.current.currentTrackId).toBeNull();
      expect(result.current.audioUrl).toBe('');
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('removeFromQueue', () => {
    it('should remove track from manual queue by qid', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockTrack);
        result.current.addToQueue(mockTrack2);
      });

      const qidToRemove = result.current.queueManual[0].qid;

      act(() => {
        result.current.removeFromQueue(qidToRemove);
      });

      expect(result.current.queueManual).toHaveLength(1);
      expect(result.current.queueManual[0].id).toBe(mockTrack2.id);
    });

    it('should not affect queue if qid does not exist', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockTrack);
      });

      const initialLength = result.current.queueManual.length;

      act(() => {
        result.current.removeFromQueue('non-existent-qid');
      });

      expect(result.current.queueManual).toHaveLength(initialLength);
    });
  });

  describe('moveManual', () => {
    it('should move track from one position to another in manual queue', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      const track3: Track = {
        id: 3,
        name: 'Track 3',
        artist: 'Artist 3',
        audio: '/test3.mp3',
      };

      act(() => {
        result.current.addToQueue(mockTrack);
        result.current.addToQueue(mockTrack2);
        result.current.addToQueue(track3);
      });

      // Move first track (index 0) to position 2
      act(() => {
        result.current.moveManual(0, 2);
      });

      expect(result.current.queueManual[0].id).toBe(mockTrack2.id);
      expect(result.current.queueManual[1].id).toBe(track3.id);
      expect(result.current.queueManual[2].id).toBe(mockTrack.id);
    });

    it('should handle moving track to the same position', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.addToQueue(mockTrack);
        result.current.addToQueue(mockTrack2);
      });

      act(() => {
        result.current.moveManual(0, 0);
      });

      expect(result.current.queueManual[0].id).toBe(mockTrack.id);
      expect(result.current.queueManual[1].id).toBe(mockTrack2.id);
    });
  });

  describe('playFromList', () => {
    it('should play from a list of tracks starting at specified track', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      const tracks = [mockTrack, mockTrack2];

      act(() => {
        result.current.playFromList(tracks, mockTrack2.id);
      });

      expect(result.current.currentTrackId).toBe(mockTrack2.id);
      expect(result.current.title).toBe(mockTrack2.name);
      expect(result.current.isPlaying).toBe(true);
    });

    it('should start at first track if no startTrackId provided', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      const tracks = [mockTrack, mockTrack2];

      act(() => {
        result.current.playFromList(tracks);
      });

      expect(result.current.currentTrackId).toBe(mockTrack.id);
      expect(result.current.title).toBe(mockTrack.name);
    });

    it('should handle empty track list gracefully', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      act(() => {
        result.current.playFromList([]);
      });

      expect(result.current.currentTrackId).toBeNull();
      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe('shuffle mode', () => {
    it('should toggle shuffle mode', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      expect(result.current.shuffle).toBe(false);

      act(() => {
        result.current.toggleShuffle();
      });

      expect(result.current.shuffle).toBe(true);

      act(() => {
        result.current.toggleShuffle();
      });

      expect(result.current.shuffle).toBe(false);
    });
  });

  describe('repeat mode', () => {
    it('should cycle through repeat modes: off -> one -> off', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      expect(result.current.repeat).toBe('off');

      act(() => {
        result.current.cycleRepeat();
      });

      expect(result.current.repeat).toBe('one');

      act(() => {
        result.current.cycleRepeat();
      });

      expect(result.current.repeat).toBe('off');
    });
  });

  describe('upNext queue combination', () => {
    it('should combine manual and auto queues correctly', () => {
      const { result } = renderHook(() => usePlayer(), { wrapper });

      const tracks = [mockTrack, mockTrack2];

      act(() => {
        result.current.playFromList(tracks, mockTrack.id);
      });

      // Auto queue should have track2
      expect(result.current.queueAuto).toHaveLength(1);
      expect(result.current.queueAuto[0].id).toBe(mockTrack2.id);

      const track3: Track = {
        id: 3,
        name: 'Manual Track',
        artist: 'Manual Artist',
        audio: '/manual.mp3',
      };

      act(() => {
        result.current.addToQueue(track3);
      });

      // Manual queue should have track3
      expect(result.current.queueManual).toHaveLength(1);

      // upNext should combine both: manual first, then auto
      expect(result.current.upNext).toHaveLength(2);
      expect(result.current.upNext[0].id).toBe(track3.id);
      expect(result.current.upNext[1].id).toBe(mockTrack2.id);
    });
  });
});
