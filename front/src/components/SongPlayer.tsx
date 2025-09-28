import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faStepBackward, faStepForward, faRedo, faListUl,
  faVolumeUp, faPlus, faShuffle,
} from '@fortawesome/free-solid-svg-icons';

import DropdownMenu from '../components/DropdownMenu';
import PlaylistCheckboxMenu from '../components/PlaylistCheckboxMenu';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';

import { usePlayer } from '../apis/PlayerContext';
import '../styles/SongPlayer.css';

type CSSVars = React.CSSProperties & Record<string, string>;
const DEFAULT_IMAGE = '/default-playlist-image.png';

const SongPlayer: React.FC = () => {
  const {
    audioUrl, title, artist, albumImage, isPlaying, setIsPlaying,
    next, prev, toggleShuffle, cycleRepeat, repeat,
    currentItem, addToQueue, currentTrackId,
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progressSec, setProgressSec] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderPct, setSliderPct] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [volumeTooltipX, setVolumeTooltipX] = useState(0);

  const [isSeeking, _setIsSeeking] = useState(false);
  const seekingRef = useRef(false);
  const setIsSeeking = (v: boolean) => { seekingRef.current = v; _setIsSeeking(v); };

  const [selectedPlaylists, setSelectedPlaylists] = useState<number[]>([]);
  const [pending, setPending] = useState<Record<number, boolean>>({});

  const getExistingIds = (): number[] => {
    if (!currentItem) return [];
    const anyItem = currentItem as any;
    const raw = Array.isArray(anyItem.playlistIds) ? anyItem.playlistIds : [];
    return raw.map((v: any) => Number(v)).filter((n: number) => Number.isFinite(n));
  };
  useEffect(() => {
    setSelectedPlaylists(getExistingIds());
    setPending({});
  }, [currentItem?.qid]);

  if (!audioRef.current) {
    const a = new Audio();
    a.preload = 'metadata';
    a.crossOrigin = 'anonymous';
    audioRef.current = a;
  }
  const nextRef = useRef(next);
  const repeatRef = useRef(repeat);
  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current!;
    if (!audioUrl) return;

    const isNewSource = lastUrlRef.current !== audioUrl;
    if (isNewSource) {
      audio.src = audioUrl;
      lastUrlRef.current = audioUrl;
      audio.currentTime = 0;
      seekingRef.current = false;
      setProgressSec(0);
      setDuration(0);
      setSliderPct(0);
    }

    const updateProgress = () => {
      if (seekingRef.current) return;
      const cur = audio.currentTime || 0;
      const dur = isFinite(audio.duration) ? audio.duration : 0;
      setProgressSec(cur);
      setSliderPct(dur > 0 ? (cur / dur) * 100 : 0);
    };

    const setAudioData = () => {
      const dur = isFinite(audio.duration) ? audio.duration : 0;
      setDuration(dur);
      if (seekingRef.current) return;
      const cur = audio.currentTime || 0;
      setProgressSec(cur);
      setSliderPct(dur > 0 ? (cur / dur) * 100 : 0);
    };

    const onEnded = () => {
      const rep = repeatRef.current;
      if (rep === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextRef.current();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('durationchange', setAudioData);
    audio.addEventListener('ended', onEnded);

    if (isNewSource) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('durationchange', setAudioData);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl, setIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current!;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {}); else audio.pause();
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current!;
    if (isPlaying) audio.pause(); else audio.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const onSeekStart = () => setIsSeeking(true);
  const onSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    setSliderPct(pct);
    const audio = audioRef.current!;
    const dur = isFinite(audio.duration) ? audio.duration : duration;
    if (dur > 0) {
      const target = (pct / 100) * dur;
      audio.currentTime = target;
      setProgressSec(target);
    }
  };
  const onSeekEnd = (e:
    | React.ChangeEvent<HTMLInputElement>
    | React.MouseEvent<HTMLInputElement>
    | React.TouchEvent<HTMLInputElement>
  ) => {
    const pct = Number((e.currentTarget as HTMLInputElement).value);
    setSliderPct(pct);
    const audio = audioRef.current!;
    const dur = isFinite(audio.duration) ? audio.duration : duration;
    if (dur > 0) {
      const target = (pct / 100) * dur;
      audio.currentTime = target;
      setProgressSec(target);
    }
    setIsSeeking(false);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    const audio = audioRef.current!;
    audio.volume = vol / 100;
    setVolume(vol);
  };
  const handleVolumeMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const x = Math.max(0, Math.min(1, percent)) * rect.width;
    setVolumeTooltipX(x);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = isFinite(sliderPct)
    ? Math.max(0, Math.min(100, sliderPct))
    : 0;

  const onPrevClick = () => {
    const audio = audioRef.current!;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
    } else {
      prev();
    }
  };

  const handleAddToQueue = () => {
    if (!currentItem) return;
    addToQueue({
      id: currentItem.id,
      name: currentItem.name,
      artist: currentItem.artist,
      album: currentItem.album,
      album_image: currentItem.album_image || '',
      audio: currentItem.audio,
      duration: (currentItem as any).duration,
      playlistIds: (currentItem as any).playlistIds || [],
    });
  };

  const handleTogglePlaylist = async (playlistId: number, checked: boolean) => {
    if (!currentItem) return;
    const trackId = Number((currentItem as any).id);
    const pid = Number(playlistId);
    if (!Number.isFinite(trackId) || !Number.isFinite(pid)) return;

    const base = selectedPlaylists.length ? selectedPlaylists : getExistingIds();

    setSelectedPlaylists(prev => {
      const cur = prev.length ? prev : base;
      return checked
        ? (cur.includes(pid) ? cur : [...cur, pid])
        : cur.filter(id => id !== pid);
    });
    setPending(p => ({ ...p, [pid]: true }));

    try {
      if (checked) await addMusicToPlaylist(pid, trackId);
      else await removeMusicFromPlaylist(pid, trackId);
    } catch {
      setSelectedPlaylists(prev => {
        const cur = prev.length ? prev : base;
        return checked
          ? cur.filter(id => id !== pid)
          : (cur.includes(pid) ? cur : [...cur, pid]);
      });
    } finally {
      setPending(p => {
        const { [pid]: _, ...rest } = p;
        return rest;
      });
    }
  };

  const baselineIds = (selectedPlaylists.length ? selectedPlaylists : getExistingIds()).map(Number);
  const idsKey = baselineIds.slice().sort((a,b)=>a-b).join('_');

  const plusMenuItems = [
    {
      label: 'Ajouter à une playlist',
      onClick: () => {},
      submenuContent: (
        <PlaylistCheckboxMenu
          key={`pcm-${currentItem?.qid ?? currentTrackId ?? 'none'}-${idsKey}`}
          existingPlaylistIds={baselineIds}
          onToggle={(playlistId, checked) => handleTogglePlaylist(playlistId, checked)}
        />
      ),
    },
    { label: "Voir l’album", onClick: () => {} },
    { label: "Voir l’artiste", onClick: () => {} },
    { label: 'Ajouter à la file d’attente', onClick: handleAddToQueue },
  ];

  return (
    <div className="song-player">
      <div className="player-left">
        <img
          key={currentItem?.qid ?? currentTrackId ?? albumImage ?? 'noimg'}
          src={albumImage ? albumImage : DEFAULT_IMAGE}
          alt="Album"
          className="player-album-image"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE; }}
        />
        <div className="song-info">
          <p className="song-title">{title || 'Aucun titre'}</p>
          <p className="song-artist">{artist || 'Artiste inconnu'}</p>
        </div>

        <DropdownMenu
          trigger={<FontAwesomeIcon icon={faPlus} className="player-icon" title="Plus d'actions" />}
          items={plusMenuItems}
          wrapperClassName="player-plus-wrapper"
          menuClassName="player-plus-menu"
          preferDirection="up"
          autoFlip
        />
      </div>

      <div className="player-center">
        <div className="controls-icons">
          <FontAwesomeIcon icon={faShuffle} className="player-icon" title="Lecture aléatoire" onClick={toggleShuffle} />
          <FontAwesomeIcon icon={faStepBackward} className="player-icon" title="Piste précédente" onClick={onPrevClick} />
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className="player-icon main-control" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Lecture'} />
          <FontAwesomeIcon icon={faStepForward} className="player-icon" title="Piste suivante" onClick={next} />
          <FontAwesomeIcon icon={faRedo} className="player-icon" title="Répéter (off → all → one)" onClick={cycleRepeat} />
        </div>

        <div className="progress-container">
          <span className="time">{formatTime(progressSec)}</span>
          <input
            type="range"
            min={0}
            max={100}
            value={progressPercent}
            step={0.1}
            onMouseDown={onSeekStart}
            onTouchStart={onSeekStart}
            onChange={onSeekChange}
            onMouseUp={onSeekEnd}
            onTouchEnd={onSeekEnd}
            className="progress-bar"
            style={{ ['--progress' as any]: `${progressPercent}%` } as CSSVars}
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <FontAwesomeIcon icon={faListUl} className="player-icon" />
        <FontAwesomeIcon icon={faVolumeUp} className="player-icon" />

        <div
          className="volume-wrapper"
          style={{ ['--tooltip-left' as any]: `${volumeTooltipX}px` } as CSSVars}
        >
          {showVolumeTooltip && <div className="volume-tooltip">{volume}%</div>}

          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={onVolumeChange}
            onMouseMove={handleVolumeMouseMove}
            onMouseDown={() => setShowVolumeTooltip(true)}
            onMouseUp={() => setShowVolumeTooltip(false)}
            onTouchStart={() => setShowVolumeTooltip(true)}
            onTouchEnd={() => setShowVolumeTooltip(false)}
            className="volume-slider"
            style={{ ['--volume' as any]: `${volume}%` } as CSSVars}
          />
        </div>
      </div>
    </div>
  );
};

export default SongPlayer;
