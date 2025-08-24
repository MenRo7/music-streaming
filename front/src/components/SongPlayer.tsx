import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faStepBackward,
  faStepForward,
  faRedo,
  faListUl,
  faVolumeUp,
  faPlus,
  faShuffle,
} from '@fortawesome/free-solid-svg-icons';

import { usePlayer } from '../apis/PlayerContext';
import '../styles/SongPlayer.css';

type CSSVars = React.CSSProperties & Record<string, string>;

const SongPlayer: React.FC = () => {
  const {
    audioUrl,
    title,
    artist,
    albumImage,
    isPlaying,
    setIsPlaying,
    next,
    prev,
    toggleShuffle,
    cycleRepeat,
    repeat,
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progressSec, setProgressSec] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sliderPct, setSliderPct] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [volumeTooltipX, setVolumeTooltipX] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  if (!audioRef.current) {
    const a = new Audio();
    a.preload = 'metadata';
    a.crossOrigin = 'anonymous';
    audioRef.current = a;
  }

  const nextRef = useRef(next);
  const repeatRef = useRef(repeat);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);
  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  const lastUrlRef = useRef<string | null>(null);
  const DEFAULT_IMAGE = '/default-playlist-image.png';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current!;
    if (!audioUrl) return;

    const isNewSource = lastUrlRef.current !== audioUrl;
    if (isNewSource) {
      audio.src = audioUrl;
      lastUrlRef.current = audioUrl;
      audio.currentTime = 0;
      setProgressSec(0);
      setDuration(0);
      setSliderPct(0);
      setIsSeeking(false);
    }

    const updateProgress = () => {
      const cur = audio.currentTime || 0;
      if (!isSeeking) {
        setProgressSec(cur);
        setSliderPct(duration > 0 ? (cur / duration) * 100 : 0);
      }
    };

    const setAudioData = () => {
      const d = isFinite(audio.duration) ? audio.duration : 0;
      setDuration(d);
      if (!isSeeking) {
        const cur = audio.currentTime || 0;
        setProgressSec(cur);
        setSliderPct(d > 0 ? (cur / d) * 100 : 0);
      }
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
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('durationchange', setAudioData);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl, setIsPlaying, isSeeking, duration]);

  useEffect(() => {
    const audio = audioRef.current!;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current!;
    if (isPlaying) audio.pause();
    else audio.play().catch(() => {});
    setIsPlaying(!isPlaying);
  };

  const onSeekStart = () => setIsSeeking(true);

  const onSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = Number(e.target.value);
    setSliderPct(pct);
    if (duration > 0) {
      const target = (pct / 100) * duration;
      const audio = audioRef.current!;
      audio.currentTime = target;
      setProgressSec(target);
    }
  };

  const onSeekEnd = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement>
      | React.TouchEvent<HTMLInputElement>
  ) => {
    const pct = Number((e.currentTarget as HTMLInputElement).value);
    setSliderPct(pct);
    if (duration > 0) {
      const target = (pct / 100) * duration;
      const audio = audioRef.current!;
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

  return (
    <div className="song-player">
      <div className="player-left">
        <img
          src={albumImage ? albumImage : DEFAULT_IMAGE}
          alt="Album"
          className="player-album-image"
        />
        <div className="song-info">
          <p className="song-title">{title || 'Aucun titre'}</p>
          <p className="song-artist">{artist || 'Artiste inconnu'}</p>
        </div>
        <FontAwesomeIcon icon={faPlus} className="player-icon" />
      </div>

      <div className="player-center">
        <div className="controls-icons">
          <FontAwesomeIcon
            icon={faShuffle}
            className="player-icon"
            title="Lecture aléatoire"
            onClick={toggleShuffle}
          />
          <FontAwesomeIcon
            icon={faStepBackward}
            className="player-icon"
            title="Piste précédente"
            onClick={prev}
          />
          <FontAwesomeIcon
            icon={isPlaying ? faPause : faPlay}
            className="player-icon main-control"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Lecture'}
          />
          <FontAwesomeIcon
            icon={faStepForward}
            className="player-icon"
            title="Piste suivante"
            onClick={next}
          />
          <FontAwesomeIcon
            icon={faRedo}
            className="player-icon"
            title="Répéter (off → all → one)"
            onClick={cycleRepeat}
          />
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
          style={
            { ['--tooltip-left' as any]: `${volumeTooltipX}px` } as CSSVars
          }
        >
          {showVolumeTooltip && (
            <div className="volume-tooltip">{volume}%</div>
          )}

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
