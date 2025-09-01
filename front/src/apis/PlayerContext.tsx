import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

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

const sameSource = (a: SourceRef, b: SourceRef) =>
  a.type === b.type && ('id' in a ? a.id : undefined) === ('id' in b ? b.id : undefined);

const sameTracks = (a: Track[], b: Track[]) =>
  a.length === b.length && a.every((t, i) => t.id === b[i]?.id);

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

  const sourceRef = useRef(source);
  const collectionRef = useRef(collection);
  useEffect(() => { sourceRef.current = source; }, [source]);
  useEffect(() => { collectionRef.current = collection; }, [collection]);

  const upNext = useMemo(() => [...queueManual, ...queueAuto], [queueManual, queueAuto]);

  const applyCurrentToCompatFields = useCallback((t: Track) => {
    setAudioUrl(t.audio || '');
    setTitle(t.name || '');
    setArtist(t.artist || '');
    setAlbumImage(t.album_image || '');
    setCurrentTrackId(t.id ?? null);
    setIsPlaying(true);
  }, []);

  const rebuildAutoFromIndex = useCallback((tracks: Track[], startIndex: number, src: SourceRef) => {
    const now = tracks[startIndex];
    const before = tracks.slice(0, startIndex);
    let tail = tracks.slice(startIndex + 1);
    tail = shuffle ? shuffleArray(tail) : tail;

    const nowItem: QueueItem = { ...now, qid: uid(), origin: 'auto', from: src };
    setCurrentItem(nowItem);
    setHistory(before.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
    setQueueAuto(tail.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
    applyCurrentToCompatFields(now);
  }, [applyCurrentToCompatFields, shuffle]);

  const setCollectionContext = useCallback<PlayerContextType['setCollectionContext']>((src, tracks) => {
    const t = tracks || [];
    // no-op si rien n'a vraiment changé
    if (sameSource(sourceRef.current, src) && sameTracks(collectionRef.current, t)) {
      return;
    }
    setSource(src);
    setCollection(t);
  }, []);

  const playSong = useCallback<PlayerContextType['playSong']>((url, name, art, img, trackId) => {
    if (trackId != null) {
      const idx = collectionRef.current.findIndex(t => t.id === trackId);
      if (idx >= 0 && sourceRef.current.type !== 'none') {
        rebuildAutoFromIndex(collectionRef.current, idx, sourceRef.current);
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
    setCurrentItem({ ...t, qid: uid(), origin: 'manual', from: sourceRef.current });
    setIsPlaying(true);
    applyCurrentToCompatFields(t);
  }, [applyCurrentToCompatFields, rebuildAutoFromIndex]);

  const addToQueue = useCallback<PlayerContextType['addToQueue']>((track) => {
    setQueueManual(q => [...q, { ...track, qid: uid(), origin: 'manual', from: sourceRef.current }]);
  }, []);

  const clearQueue = useCallback<PlayerContextType['clearQueue']>((keepCurrent = true) => {
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
  }, []);

  const removeFromQueue = useCallback<PlayerContextType['removeFromQueue']>((qid) => {
    setQueueManual(m => m.filter(i => i.qid !== qid));
    setQueueAuto(a => a.filter(i => i.qid !== qid));
  }, []);

  const moveManual = useCallback<PlayerContextType['moveManual']>((from, to) => {
    setQueueManual(list => {
      const l = list.slice();
      const [item] = l.splice(from, 1);
      l.splice(to, 0, item);
      return l;
    });
  }, []);

  const playNowFromQueue = useCallback<PlayerContextType['playNowFromQueue']>((qid) => {
    let item: QueueItem | undefined;
    setQueueManual(m => {
      const found = m.find(i => i.qid === qid);
      if (found) item = found;
      return m.filter(i => i.qid !== qid);
    });
    setQueueAuto(a => {
      if (!item) {
        const found = a.find(i => i.qid === qid);
        if (found) item = found;
      }
      return a.filter(i => i.qid !== qid);
    });
    if (!item) return;
    setCurrentItem(prev => (prev ? (setHistory(h => [...h, prev]), item!) : item!));
    applyCurrentToCompatFields(item);
  }, [applyCurrentToCompatFields]);

  const next = useCallback(() => {
    setCurrentItem(cur => {
      if (!cur) return cur;
      if (repeat === 'one') {
        setIsPlaying(true);
        return cur;
      }
      setHistory(h => [...h, cur]);

      let nextItem: QueueItem | undefined;

      setQueueManual(m => {
        if (m.length > 0) {
          [nextItem, ...m] = m;
          setQueueManual(m.slice(1));
        }
        return m;
      });

      if (!nextItem) {
        setQueueAuto(a => {
          if (a.length > 0) {
            [nextItem, ...a] = a;
            setQueueAuto(a.slice(1));
          }
          return a;
        });
      }

      if (nextItem) {
        applyCurrentToCompatFields(nextItem);
        return nextItem;
      }

      if (repeat === 'all' && sourceRef.current.type !== 'none' && collectionRef.current.length > 0) {
        rebuildAutoFromIndex(collectionRef.current, 0, sourceRef.current);
        return cur; // sera remplacé par rebuild
      }

      setIsPlaying(false);
      return cur;
    });
  }, [applyCurrentToCompatFields, rebuildAutoFromIndex, repeat]);

  const prev = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const copy = h.slice();
      const last = copy.pop()!;
      setCurrentItem(cur => {
        if (cur) setQueueAuto(a => [cur, ...a]);
        applyCurrentToCompatFields(last);
        return last;
      });
      return copy;
    });
  }, [applyCurrentToCompatFields]);

  const toggleShuffle = useCallback(() => {
    setShuffle(s => {
      const ns = !s;
      setQueueAuto(a => (ns ? shuffleArray(a) : a));
      return ns;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat(r => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  const value: PlayerContextType = useMemo(() => ({
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
    playSong, setIsPlaying,
    currentItem, upNext, queueManual, queueAuto, shuffle, repeat, source,
    setCollectionContext, addToQueue, clearQueue, removeFromQueue, moveManual, playNowFromQueue,
    next, prev, toggleShuffle, cycleRepeat,
  }), [
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
    currentItem, upNext, queueManual, queueAuto, shuffle, repeat, source,
    playSong, setIsPlaying,
    setCollectionContext, addToQueue, clearQueue, removeFromQueue, moveManual, playNowFromQueue,
    next, prev, toggleShuffle, cycleRepeat,
  ]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
};
