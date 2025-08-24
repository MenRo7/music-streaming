import React, { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type Track = {
  id: number;
  name: string;
  artist: string;
  album?: string;
  album_image?: string;
  audio: string;
  duration?: string;
};

type SourceRef =
  | { type: 'playlist'; id: number }
  | { type: 'album'; id: number }
  | { type: 'none' };

type QueueItem = Track & {
  qid: string;
  origin: 'manual' | 'auto';
  from?: SourceRef;
};

type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerContextType {
  audioUrl: string;
  title: string;
  artist: string;
  albumImage: string;
  currentTrackId: number | null;
  isPlaying: boolean;
  playSong: (url: string, title: string, artist: string, albumImage: string, trackId?: number) => void;
  setIsPlaying: (playing: boolean) => void;
  currentItem: QueueItem | null;
  upNext: QueueItem[];
  queueManual: QueueItem[];
  queueAuto: QueueItem[];
  shuffle: boolean;
  repeat: RepeatMode;
  source: SourceRef;

  setCollectionContext: (src: Exclude<SourceRef, { type: 'none' }>, tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  clearQueue: (keepCurrent?: boolean) => void;
  removeFromQueue: (qid: string) => void;
  moveManual: (from: number, to: number) => void;
  playNowFromQueue: (qid: string) => void;

  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const uid = () => Math.random().toString(36).slice(2, 10);
const shuffleArray = <T,>(arr: T[]) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [audioUrl, setAudioUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [albumImage, setAlbumImage] = useState('');
  const [currentTrackId, setCurrentTrackId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentItem, setCurrentItem] = useState<QueueItem | null>(null);
  const [queueManual, setQueueManual] = useState<QueueItem[]>([]);
  const [queueAuto, setQueueAuto] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<QueueItem[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');

  const [source, setSource] = useState<SourceRef>({ type: 'none' });
  const [collection, setCollection] = useState<Track[]>([]);

  const upNext = useMemo(() => [...queueManual, ...queueAuto], [queueManual, queueAuto]);

  const applyCurrentToCompatFields = (t: Track) => {
    setAudioUrl(t.audio || '');
    setTitle(t.name || '');
    setArtist(t.artist || '');
    setAlbumImage(t.album_image || '');
    setCurrentTrackId(t.id ?? null);
    setIsPlaying(true);
  };

  const rebuildAutoFromIndex = (tracks: Track[], startIndex: number, src: SourceRef) => {
    const now = tracks[startIndex];
    const before = tracks.slice(0, startIndex);
    let tail = tracks.slice(startIndex + 1);
    tail = shuffle ? shuffleArray(tail) : tail;

    const nowItem: QueueItem = { ...now, qid: uid(), origin: 'auto', from: src };
    setCurrentItem(nowItem);
    setHistory(before.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
    setQueueAuto(tail.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
    applyCurrentToCompatFields(now);
  };

  const setCollectionContext: PlayerContextType['setCollectionContext'] = (src, tracks) => {
    setSource(src);
    setCollection(tracks || []);
  };

  const playSong: PlayerContextType['playSong'] = (url, name, art, img, trackId) => {
    if (trackId != null) {
      const idx = collection.findIndex(t => t.id === trackId);
      if (idx >= 0 && source.type !== 'none') {
        rebuildAutoFromIndex(collection, idx, source);
        return;
      }
    }
    const t: Track = {
      id: trackId ?? -Date.now(),
      name,
      artist: art,
      album_image: img,
      audio: url,
    };
    setCurrentItem({ ...t, qid: uid(), origin: 'manual', from: source });
    setIsPlaying(true);
    applyCurrentToCompatFields(t);
  };

  const addToQueue: PlayerContextType['addToQueue'] = (track) => {
    setQueueManual(q => [...q, { ...track, qid: uid(), origin: 'manual', from: source }]);
  };

  const clearQueue: PlayerContextType['clearQueue'] = (keepCurrent = true) => {
    setQueueManual([]);
    setQueueAuto([]);
    if (!keepCurrent) {
      setCurrentItem(null);
      setIsPlaying(false);
      setHistory([]);
      setSource({ type: 'none' });
      setCollection([]);
      setAudioUrl('');
      setTitle('');
      setArtist('');
      setAlbumImage('');
      setCurrentTrackId(null);
    }
  };

  const removeFromQueue: PlayerContextType['removeFromQueue'] = (qid) => {
    setQueueManual(m => m.filter(i => i.qid !== qid));
    setQueueAuto(a => a.filter(i => i.qid !== qid));
  };

  const moveManual: PlayerContextType['moveManual'] = (from, to) => {
    setQueueManual(list => {
      const l = list.slice();
      const [item] = l.splice(from, 1);
      l.splice(to, 0, item);
      return l;
    });
  };

  const playNowFromQueue: PlayerContextType['playNowFromQueue'] = (qid) => {
    const item = queueManual.find(i => i.qid === qid) || queueAuto.find(i => i.qid === qid);
    if (!item) return;
    if (currentItem) setHistory(h => [...h, currentItem]);
    setQueueManual(m => m.filter(i => i.qid !== qid));
    setQueueAuto(a => a.filter(i => i.qid !== qid));
    setCurrentItem(item);
    applyCurrentToCompatFields(item);
  };

  const next = () => {
    if (!currentItem) return;
    if (repeat === 'one') {
      setIsPlaying(true);
      return;
    }
    setHistory(h => [...h, currentItem]);

    if (queueManual.length > 0) {
      const [n, ...rest] = queueManual;
      setQueueManual(rest);
      setCurrentItem(n);
      applyCurrentToCompatFields(n);
      return;
    }
    if (queueAuto.length > 0) {
      const [n, ...rest] = queueAuto;
      setQueueAuto(rest);
      setCurrentItem(n);
      applyCurrentToCompatFields(n);
      return;
    }

    if (repeat === 'all' && source.type !== 'none' && collection.length > 0) {
      rebuildAutoFromIndex(collection, 0, source);
      return;
    }
    setIsPlaying(false);
  };

  const prev = () => {
    if (history.length === 0) return;
    const h = history.slice();
    const last = h.pop()!;
    if (currentItem) setQueueAuto(a => [currentItem, ...a]);
    setHistory(h);
    setCurrentItem(last);
    applyCurrentToCompatFields(last);
  };

  const toggleShuffle = () => {
    setShuffle(s => {
      const ns = !s;
      setQueueAuto(a => (ns ? shuffleArray(a) : a));
      return ns;
    });
  };

  const cycleRepeat = () => {
    setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  };

  const value: PlayerContextType = {
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying, playSong, setIsPlaying,
    currentItem, upNext, queueManual, queueAuto, shuffle, repeat, source,
    setCollectionContext, addToQueue, clearQueue, removeFromQueue, moveManual, playNowFromQueue,
    next, prev, toggleShuffle, cycleRepeat,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
};
