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
import debounce from 'lodash.debounce';

export type Track = {
  id: number;
  name: string;
  artist: string;
  album?: string;
  album_image?: string;
  audio: string;
  duration?: string;
  playlistIds?: number[];
  dateAdded?: string;
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

type PlaySongOpts = {
  playlistIds?: Array<number | string>;
};

export interface PlayerContextType {
  audioUrl: string;
  title: string;
  artist: string;
  albumImage: string;
  currentTrackId: number | null;
  isPlaying: boolean;

  playSong: (
    url: string,
    title: string,
    artist: string,
    albumImage: string,
    trackId?: number,
    opts?: PlaySongOpts
  ) => void;
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

const toNumArr = (arr?: Array<number | string>) =>
  (Array.isArray(arr) ? arr : []).map(Number).filter(Number.isFinite) as number[];

type PersistedState = {
  audioUrl: string;
  title: string;
  artist: string;
  albumImage: string;
  currentTrackId: number | null;
  isPlaying: boolean;
  currentItem: QueueItem | null;
  queueManual: QueueItem[];
  queueAuto: QueueItem[];
  history: QueueItem[];
  shuffle: boolean;
  repeat: RepeatMode;
  source: SourceRef;
  collection: Track[];
};

const STORAGE_PREFIX = 'player:queue:v1';

const getUserId = (): number | null => {
  const raw = localStorage.getItem('currentUserId');
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const keyFor = (userId: number) => `${STORAGE_PREFIX}:${userId}`;

const safeParse = <T,>(s: string | null): T | null => {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};

// ----------------------------------------

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

  const queueManualRef = useRef<QueueItem[]>(queueManual);
  const queueAutoRef = useRef<QueueItem[]>(queueAuto);
  useEffect(() => { queueManualRef.current = queueManual; }, [queueManual]);
  useEffect(() => { queueAutoRef.current = queueAuto; }, [queueAuto]);

  const upNext = useMemo(() => [...queueManual, ...queueAuto], [queueManual, queueAuto]);

  const applyCurrentToCompatFields = useCallback((t: Track) => {
    setAudioUrl(t.audio || '');
    setTitle(t.name || '');
    setArtist(t.artist || '');
    setAlbumImage(t.album_image || '');
    setCurrentTrackId(t.id ?? null);
    setIsPlaying(true);
  }, []);

  const rebuildAutoFromIndex = useCallback(
    (tracks: Track[], startIndex: number, src: SourceRef) => {
      const now = tracks[startIndex];
      const before = tracks.slice(0, startIndex);
      let tail = tracks.slice(startIndex + 1);
      tail = shuffle ? shuffleArray(tail) : tail;

      const nowItem: QueueItem = { ...now, qid: uid(), origin: 'auto', from: src };
      setCurrentItem(nowItem);
      setHistory(before.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
      setQueueAuto(tail.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
      applyCurrentToCompatFields(now);
    },
    [applyCurrentToCompatFields, shuffle]
  );

  const setCollectionContext = useCallback<PlayerContextType['setCollectionContext']>((src, tracks) => {
    const t = tracks || [];
    if (sameSource(sourceRef.current, src) && sameTracks(collectionRef.current, t)) {
      return;
    }
    setSource(src);
    setCollection(t);
  }, []);

  const playSong = useCallback<PlayerContextType['playSong']>((url, name, art, img, trackId, opts) => {
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
      playlistIds: toNumArr(opts?.playlistIds),
    };
    setCurrentItem({ ...t, qid: uid(), origin: 'manual', from: sourceRef.current });
    setIsPlaying(true);
    applyCurrentToCompatFields(t);
  }, [applyCurrentToCompatFields, rebuildAutoFromIndex]);

  const addToQueue = useCallback<PlayerContextType['addToQueue']>((track) => {
    setQueueManual(q => [...q, { ...track, qid: uid(), origin: 'manual', from: sourceRef.current }]);
  }, []);

  const hardReset = useCallback(() => {
    setQueueManual([]);
    setQueueAuto([]);
    setHistory([]);
    setCurrentItem(null);
    setIsPlaying(false);
    setSource({ type: 'none' });
    setCollection([]);
    setAudioUrl('');
    setTitle('');
    setArtist('');
    setAlbumImage('');
    setCurrentTrackId(null);
    setShuffle(false);
    setRepeat('off');
  }, []);

  const clearQueue = useCallback<PlayerContextType['clearQueue']>((keepCurrent = true) => {
    setQueueManual([]);
    setQueueAuto([]);
    if (!keepCurrent) {
      hardReset();
    }
  }, [hardReset]);

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
    const manual = queueManualRef.current;
    const auto = queueAutoRef.current;

    const item =
      manual.find(i => i.qid === qid) ||
      auto.find(i => i.qid === qid);

    if (!item) return;

    setQueueManual(manual.filter(i => i.qid !== qid));
    setQueueAuto(auto.filter(i => i.qid !== qid));

    setCurrentItem(prev => {
      if (prev) setHistory(h => [...h, prev]);
      return item;
    });

    applyCurrentToCompatFields(item);
  }, [applyCurrentToCompatFields]);

  const next = useCallback(() => {
    setCurrentItem((cur) => {
      if (!cur) return cur;

      if (repeat === 'one') {
        setIsPlaying(true);
        return cur;
      }

      setHistory((h) => [...h, cur]);

      const manual = queueManualRef.current;
      const auto = queueAutoRef.current;

      let nextItem: QueueItem | undefined;
      let nextManual = manual;
      let nextAuto = auto;

      if (manual.length > 0) {
        nextItem = manual[0];
        nextManual = manual.slice(1);
      } else if (auto.length > 0) {
        nextItem = auto[0];
        nextAuto = auto.slice(1);
      }

      if (nextItem) {
        setQueueManual(nextManual);
        setQueueAuto(nextAuto);
        applyCurrentToCompatFields(nextItem);
        return nextItem;
      }

      if (repeat === 'all' && sourceRef.current.type !== 'none' && collectionRef.current.length > 0) {
        rebuildAutoFromIndex(collectionRef.current, 0, sourceRef.current);
        return cur;
      }

      setIsPlaying(false);
      return cur;
    });
  }, [applyCurrentToCompatFields, rebuildAutoFromIndex, repeat]);

  const prev = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;

      const copy = h.slice();
      const last = copy.pop()!;

      setCurrentItem((cur) => {
        if (cur) {
          if (cur.origin === 'manual') {
            setQueueManual((m) => [cur, ...m]);
          } else {
            setQueueAuto((a) => [cur, ...a]);
          }
        }
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

  const debouncedSave = useMemo(
    () =>
      debounce((state: PersistedState, userId: number | null) => {
        if (!userId) return;
        try {
          localStorage.setItem(keyFor(userId), JSON.stringify(state));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn('Impossible de sauvegarder la queue', e);
        }
      }, 200),
    []
  );

  useEffect(() => {
    const userId = getUserId();
    const snapshot: PersistedState = {
      audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
      currentItem, queueManual, queueAuto, history, shuffle, repeat, source, collection,
    };
    debouncedSave(snapshot, userId);
  }, [
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
    currentItem, queueManual, queueAuto, history, shuffle, repeat, source, collection,
    debouncedSave,
  ]);

  const restoreForUser = useCallback((userId: number | null) => {
    if (!userId) {
      hardReset();
      return;
    }
    const raw = localStorage.getItem(keyFor(userId));
    const data = safeParse<PersistedState>(raw);
    if (!data) return;

    setAudioUrl(data.audioUrl || '');
    setTitle(data.title || '');
    setArtist(data.artist || '');
    setAlbumImage(data.albumImage || '');
    setCurrentTrackId(data.currentTrackId ?? null);
    setIsPlaying(Boolean(data.isPlaying));

    setCurrentItem(data.currentItem || null);
    setQueueManual(Array.isArray(data.queueManual) ? data.queueManual : []);
    setQueueAuto(Array.isArray(data.queueAuto) ? data.queueAuto : []);
    setHistory(Array.isArray(data.history) ? data.history : []);
    setShuffle(Boolean(data.shuffle));
    setRepeat(data.repeat || 'off');
    setSource(data.source || { type: 'none' });
    setCollection(Array.isArray(data.collection) ? data.collection : []);
  }, [hardReset]);

  useEffect(() => {
    const uid = getUserId();
    if (uid) restoreForUser(uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onUserLoaded = (e: any) => {
      const uid = e?.detail?.userId ?? null;
      restoreForUser(uid);
    };
    window.addEventListener('user:loaded', onUserLoaded);
    return () => window.removeEventListener('user:loaded', onUserLoaded);
  }, [restoreForUser]);

  useEffect(() => {
    const onAuthChanged = () => {
      hardReset();
    };
    window.addEventListener('auth:changed', onAuthChanged);
    return () => window.removeEventListener('auth:changed', onAuthChanged);
  }, [hardReset]);

  const value: PlayerContextType = useMemo(() => ({
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
    playSong, setIsPlaying,
    currentItem, upNext, queueManual, queueAuto, shuffle, repeat, source,
    setCollectionContext, addToQueue, clearQueue, removeFromQueue, moveManual, playNowFromQueue,
    next, prev, toggleShuffle, cycleRepeat,
  }), [
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
    currentItem, upNext, queueManual, queueAuto, shuffle, repeat, source,
    playSong,
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
