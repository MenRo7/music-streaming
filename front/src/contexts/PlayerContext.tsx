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
import { checkTracksExist } from '../apis/MusicService';
import { Analytics } from '../utils/analytics';

export type Track = {
  id: number;
  name: string;
  artist: string;
  album?: string;
  album_image?: string;
  audio: string;
  duration?: number | string;  // Durée en secondes (number) ou formatée (string)
  playlistIds?: number[];
  dateAdded?: string;
  album_id?: number;
  artist_user_id?: number;
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

type RepeatMode = 'off' | 'one';

type PlaySongOpts = {
  playlistIds?: Array<number | string>;
  album_id?: number;
  artist_user_id?: number;
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
  playFromList: (tracks: Track[], startTrackId?: number) => void;
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
  isHydrating: boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const uid = () => Math.random().toString(36).slice(2, 10);
const shuffleArray = <T,>(arr: ReadonlyArray<T> | null | undefined): T[] => {
  const base = Array.isArray(arr) ? arr : (arr ? Array.from(arr as any) : []);
  const a = base.slice(0, (base.length >>> 0));
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
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
  repeat: any;
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
  try { return JSON.parse(s) as T; } catch { return null; }
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
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  const sourceRef = useRef(source);
  const collectionRef = useRef(collection);
  useEffect(() => { sourceRef.current = source; }, [source]);
  useEffect(() => { collectionRef.current = collection; }, [collection]);

  const queueManualRef = useRef<QueueItem[]>(queueManual);
  const queueAutoRef = useRef<QueueItem[]>(queueAuto);
  useEffect(() => { queueManualRef.current = queueManual; }, [queueManual]);
  useEffect(() => { queueAutoRef.current = queueAuto; }, [queueAuto]);

  const currentItemRef = useRef<QueueItem | null>(currentItem);
  useEffect(() => { currentItemRef.current = currentItem; }, [currentItem]);

  const upNext = useMemo(() => [...queueManual, ...queueAuto], [queueManual, queueAuto]);

  const applyCurrentToCompatFields = useCallback((t: Track) => {
    setAudioUrl(t.audio || '');
    setTitle(t.name || '');
    setArtist(t.artist || '');
    setAlbumImage(t.album_image || '');
    setCurrentTrackId(t.id ?? null);
    setIsPlaying(true);

    // Track music play event in Google Analytics
    Analytics.playTrack(t.name, t.artist, t.album);
  }, []);

  const rebuildAutoFromIndex = useCallback(
    (
      tracks: Track[],
      startIndex: number,
      src: SourceRef,
      opts?: { forceShuffle?: boolean }
    ) => {
      const useShuf = opts?.forceShuffle ?? shuffle;

      const now = tracks[startIndex];
      const before = tracks.slice(0, startIndex);

      let tail: Track[];
      if (useShuf) {
        const pool = tracks.filter((_, i) => i !== startIndex);
        tail = shuffleArray(pool);
      } else {
        tail = tracks.slice(startIndex + 1);
      }

      const nowItem: QueueItem = { ...now, qid: uid(), origin: 'auto', from: src };
      setCurrentItem(nowItem);
      setHistory(useShuf ? [] : before.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
      setQueueAuto(tail.map(t => ({ ...t, qid: uid(), origin: 'auto', from: src })));
      applyCurrentToCompatFields(now);
    },
    [applyCurrentToCompatFields, shuffle]
  );

  const setCollectionContext = useCallback<PlayerContextType['setCollectionContext']>((src, tracks) => {
    const t = Array.isArray(tracks) ? tracks.slice() : [];
    if (sameSource(sourceRef.current, src) && sameTracks(collectionRef.current, t)) return;
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
      album_id: opts?.album_id,
      artist_user_id: opts?.artist_user_id,
    };
    setCurrentItem({ ...t, qid: uid(), origin: 'manual', from: sourceRef.current });
    setIsPlaying(true);
    applyCurrentToCompatFields(t);
  }, [applyCurrentToCompatFields, rebuildAutoFromIndex]);

  const playFromList = useCallback<PlayerContextType['playFromList']>((tracks, startTrackId) => {
    const list = Array.isArray(tracks) ? tracks.slice() : [];
    if (list.length === 0) return;

    const idx = startTrackId != null
      ? Math.max(0, list.findIndex(t => Number(t.id) === Number(startTrackId)))
      : 0;

    const virtualSrc: SourceRef = { type: 'playlist', id: 0 };
    setSource(virtualSrc);
    setCollection(list);
    rebuildAutoFromIndex(list, idx >= 0 ? idx : 0, virtualSrc);
  }, [rebuildAutoFromIndex]);

  const addToQueue = useCallback<PlayerContextType['addToQueue']>((track) => {
    setQueueManual(q => [...q, { ...track, qid: uid(), origin: 'manual', from: sourceRef.current }]);

    // Track add to queue event
    Analytics.addToQueue(track.name, track.artist);
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
    if (!keepCurrent) hardReset();
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
      applyCurrentToCompatFields(item);
      return item;
    });
  }, [applyCurrentToCompatFields]);

  const next = useCallback(() => {
    const cur = currentItemRef.current;
    if (!cur) return;

    setHistory(h => [...h, cur]);

    const manual = queueManualRef.current || [];
    const auto = queueAutoRef.current || [];

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
      setCurrentItem(nextItem);
      applyCurrentToCompatFields(nextItem);
      return;
    }

    setIsPlaying(false);
  }, [applyCurrentToCompatFields]);

  const prev = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;

      const copy = h.slice();
      const last = copy.pop()!;

      setCurrentItem((cur) => {
        if (cur) {
          if (cur.origin === 'manual') setQueueManual((m) => [cur, ...m]);
          else setQueueAuto((a) => [cur, ...a]);
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

      const cur = currentItemRef.current;
      const src = sourceRef.current;
      const cols = collectionRef.current;

      if (!cur || src.type === 'none' || !Array.isArray(cols) || cols.length === 0) {
        setQueueAuto(a => ns ? shuffleArray(a ?? []) : (Array.isArray(a) ? a : []));
        return ns;
      }

      if (cols.length === 1) {
        return ns;
      }

      const idx = cols.findIndex(t => t?.id === cur.id);
      if (idx >= 0) {
        rebuildAutoFromIndex(cols, idx, src, { forceShuffle: ns });
      } else {
        setQueueAuto(a => ns ? shuffleArray(a ?? []) : (Array.isArray(a) ? a : []));
      }
      return ns;
    });
  }, [rebuildAutoFromIndex]);

  const cycleRepeat = useCallback(() => {
    setRepeat((r: RepeatMode) => (r === 'off' ? 'one' : 'off'));
  }, []);

  const debouncedSave = useMemo(
    () => debounce((state: PersistedState, userId: number | null) => {
      if (!userId) return;
      try { localStorage.setItem(keyFor(userId), JSON.stringify(state)); }
      catch (e) { console.warn('Impossible de sauvegarder la queue', e); }
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

  const hydrateForUser = useCallback(async (userId: number | null) => {
    setIsHydrating(true);

    if (!userId) {
      hardReset();
      setIsHydrating(false);
      return;
    }

    const raw = localStorage.getItem(keyFor(userId));
    const data = safeParse<PersistedState>(raw);

    if (!data) { setIsHydrating(false); return; }

    const ids = new Set<number>();
    if (data.currentItem?.id) ids.add(data.currentItem.id);
    (data.queueManual || []).forEach(i => ids.add(i.id));
    (data.queueAuto || []).forEach(i => ids.add(i.id));
    (data.history || []).forEach(i => ids.add(i.id));
    (data.collection || []).forEach(t => ids.add(t.id));

    let existingSet = new Set<number>();
    try {
      const existing = await checkTracksExist([...ids]);
      existingSet = new Set(existing.map(Number));
    } catch (_e) {
      existingSet = new Set([...ids]);
    }

    const filterList = <T extends { id: number }>(list: T[]) =>
      (Array.isArray(list) ? list : []).filter(it => existingSet.has(it.id));

    const filteredCurrent = data.currentItem && existingSet.has(data.currentItem.id)
      ? data.currentItem
      : null;

    const sanitizedRepeat: RepeatMode = data.repeat === 'one' ? 'one' : 'off';

    const sanitized = {
      ...data,
      currentItem: filteredCurrent,
      isPlaying: filteredCurrent ? data.isPlaying : false,
      currentTrackId: filteredCurrent ? filteredCurrent.id : null,
      queueManual: filterList(data.queueManual),
      queueAuto: filterList(data.queueAuto),
      history: filterList(data.history),
      collection: filterList(data.collection),
      repeat: sanitizedRepeat,
    };

    setAudioUrl(sanitized.audioUrl || '');
    setTitle(sanitized.title || '');
    setArtist(sanitized.artist || '');
    setAlbumImage(sanitized.albumImage || '');
    setCurrentTrackId(sanitized.currentTrackId ?? null);
    setIsPlaying(Boolean(sanitized.isPlaying));

    setCurrentItem(sanitized.currentItem || null);
    setQueueManual(Array.isArray(sanitized.queueManual) ? sanitized.queueManual : []);
    setQueueAuto(Array.isArray(sanitized.queueAuto) ? sanitized.queueAuto : []);
    setHistory(Array.isArray(sanitized.history) ? sanitized.history : []);
    setShuffle(Boolean(sanitized.shuffle));
    setRepeat(sanitized.repeat as RepeatMode);
    setSource(sanitized.source || { type: 'none' });
    setCollection(Array.isArray(sanitized.collection) ? sanitized.collection : []);

    try { localStorage.setItem(keyFor(userId), JSON.stringify(sanitized)); } catch {}

    setIsHydrating(false);
  }, [hardReset]);

  const sanitizeFromServer = useCallback(async () => {
    try {
      const ids = new Set<number>();
      if (currentItem?.id) ids.add(currentItem.id);
      queueManualRef.current.forEach(i => ids.add(i.id));
      queueAutoRef.current.forEach(i => ids.add(i.id));
      history.forEach(i => ids.add(i.id));
      collectionRef.current.forEach(t => ids.add(t.id));
      if (ids.size === 0) return;

      const existing = await checkTracksExist([...ids]);
      const existingSet = new Set(existing);
      const missing = [...ids].filter(id => !existingSet.has(id));
      if (missing.length) {
        window.dispatchEvent(new CustomEvent('tracks:deleted', { detail: { ids: missing } }));
      }
    } catch (e) {
      console.warn('sanitizeFromServer failed', e);
    }
  }, [currentItem, history]);

  useEffect(() => {
    const uid = getUserId();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    hydrateForUser(uid);
  }, [hydrateForUser]);

  useEffect(() => {
    const onUserLoaded = (e: any) => {
      const uid = e?.detail?.userId ?? null;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      hydrateForUser(uid);
    };
    window.addEventListener('user:loaded', onUserLoaded);
    return () => window.removeEventListener('user:loaded', onUserLoaded);
  }, [hydrateForUser]);

  useEffect(() => {
    const onAuthChanged = () => { hardReset(); };
    window.addEventListener('auth:changed', onAuthChanged);
    return () => window.removeEventListener('auth:changed', onAuthChanged);
  }, [hardReset]);

  useEffect(() => {
    const onFocus = () => { sanitizeFromServer(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [sanitizeFromServer]);

  useEffect(() => {
    const onLibraryChanged = () => { sanitizeFromServer(); };
    window.addEventListener('library:changed', onLibraryChanged);
    return () => window.removeEventListener('library:changed', onLibraryChanged);
  }, [sanitizeFromServer]);

  const mergeUpdate = useCallback((item: QueueItem, map: Map<number, Partial<Track>>): QueueItem => {
    const u = map.get(item.id);
    if (!u) return item;
    const merged: QueueItem = {
      ...item,
      name: u.name ?? item.name,
      artist: u.artist ?? item.artist,
      album: u.album ?? item.album,
      album_image: u.album_image ?? item.album_image,
      audio: u.audio ?? item.audio,
      duration: u.duration ?? item.duration,
      album_id: u.album_id ?? item.album_id,
      artist_user_id: u.artist_user_id ?? item.artist_user_id,
    };
    return merged;
  }, []);

  useEffect(() => {
    const onTracksUpdated = (e: any) => {
      const updates: Partial<Track>[] = e?.detail?.tracks || [];
      if (!Array.isArray(updates) || updates.length === 0) return;

      const map = new Map<number, Partial<Track>>();
      for (const t of updates) if (t && typeof t.id === 'number') map.set(t.id, t);
      if (map.size === 0) return;

      setCurrentItem(ci => {
        if (!ci) return ci;
        const next = mergeUpdate(ci, map);
        if (next !== ci && next.id === ci.id) applyCurrentToCompatFields(next);
        return next;
      });
      setQueueManual(list => list.map(it => mergeUpdate(it, map)));
      setQueueAuto(list => list.map(it => mergeUpdate(it, map)));
      setCollection(cols => cols.map(c => {
        const u = map.get(c.id);
        return u ? { ...c,
          name: u.name ?? c.name,
          artist: u.artist ?? c.artist,
          album: u.album ?? c.album,
          album_image: u.album_image ?? c.album_image,
          audio: u.audio ?? c.audio,
          duration: u.duration ?? c.duration,
          album_id: u.album_id ?? c.album_id,
          artist_user_id: u.artist_user_id ?? c.artist_user_id,
        } : c;
      }));
    };

    const onTracksDeleted = (e: any) => {
      const ids: number[] = (e?.detail?.ids || []).map(Number).filter(Number.isFinite);
      if (!Array.isArray(ids) || ids.length === 0) return;

      setQueueManual(list => list.filter(it => !ids.includes(it.id)));
      setQueueAuto(list => list.filter(it => !ids.includes(it.id)));
      setHistory(list => list.filter(it => !ids.includes(it.id)));
      setCurrentItem(ci => {
        if (ci && ids.includes(ci.id)) {
          setIsPlaying(false);
          return null;
        }
        return ci;
      });
    };

    window.addEventListener('tracks:updated', onTracksUpdated);
    window.addEventListener('tracks:deleted', onTracksDeleted);
    return () => {
      window.removeEventListener('tracks:updated', onTracksUpdated);
      window.removeEventListener('tracks:deleted', onTracksDeleted);
    };
  }, [applyCurrentToCompatFields, mergeUpdate, currentItem]);

  const value: PlayerContextType = useMemo(() => ({
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
    playSong, playFromList,
    setIsPlaying,
    currentItem, upNext, queueManual, queueAuto, shuffle, repeat, source,
    setCollectionContext, addToQueue, clearQueue, removeFromQueue, moveManual, playNowFromQueue,
    next, prev, toggleShuffle, cycleRepeat,
    isHydrating,
  }), [
    audioUrl, title, artist, albumImage, currentTrackId, isPlaying,
    currentItem, upNext, queueManual, queueAuto, shuffle, repeat, source,
    playSong, playFromList,
    setCollectionContext, addToQueue, clearQueue, removeFromQueue, moveManual, playNowFromQueue,
    next, prev, toggleShuffle, cycleRepeat,
    isHydrating,
  ]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = (): PlayerContextType => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within a PlayerProvider');
  return ctx;
};
