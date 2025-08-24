import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faStepBackward, faStepForward,
  faRedo, faListUl, faVolumeUp, faPlus, faShuffle
} from '@fortawesome/free-solid-svg-icons';

import { usePlayer } from '../apis/PlayerContext';
import '../styles/SongPlayer.css';

const SongPlayer: React.FC = () => {
  const {
    audioUrl, title, artist, albumImage,
    isPlaying, setIsPlaying,
    next, prev, toggleShuffle, cycleRepeat, repeat, shuffle,
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
  const [volumeTooltipX, setVolumeTooltipX] = useState(0);

  if (!audioRef.current) {
    audioRef.current = new Audio();
  }

  const nextRef = useRef(next);
  const repeatRef = useRef(repeat);
  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);

  const DEFAULT_IMAGE = '/default-playlist-image.png';

  useEffect(() => {
    const audio = audioRef.current!;
    if (!audioUrl) return;

    audio.src = audioUrl;
    audio.currentTime = 0;
    audio.volume = volume / 100;
    setProgress(0);
    setDuration(0);

    const updateProgress = () => setProgress(audio.currentTime);
    const setAudioData = () => {
      setDuration(audio.duration || 0);
      setProgress(audio.currentTime || 0);
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
    audio.addEventListener('ended', onEnded);

    audio.play().then(() => setIsPlaying(true)).catch(() => {});

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl, setIsPlaying, volume]);

  useEffect(() => {
    const audio = audioRef.current!;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {}); else audio.pause();
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current!;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current!;
    const value = Number(e.target.value);
    audio.currentTime = value;
    setProgress(value);
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
    setVolumeTooltipX(Math.max(0, Math.min(1, percent)) * rect.width);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div className="song-player">
      <div className="player-left">
        <img src={albumImage ? albumImage : DEFAULT_IMAGE} alt="Album" className="player-album-image" />
        <div className="song-info">
          <p className="song-title">{title || 'Aucun titre'}</p>
          <p className="song-artist">{artist || 'Artiste inconnu'}</p>
        </div>
        <FontAwesomeIcon icon={faPlus} className="player-icon" />
      </div>

      <div className="player-center">
        <div className="controls-icons">
          <FontAwesomeIcon icon={faShuffle} className="player-icon" title="Lecture aléatoire" onClick={toggleShuffle} />
          <FontAwesomeIcon icon={faStepBackward} className="player-icon" title="Piste précédente" onClick={prev} />
          <FontAwesomeIcon
            icon={isPlaying ? faPause : faPlay}
            className="player-icon main-control"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Lecture'}
          />
          <FontAwesomeIcon icon={faStepForward} className="player-icon" title="Piste suivante" onClick={next} />
          <FontAwesomeIcon icon={faRedo} className="player-icon" title="Répéter (off → all → one)" onClick={cycleRepeat} />
        </div>

        <div className="progress-container">
          <span className="time">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={onSeek}
            className="progress-bar"
            style={{
              background: `linear-gradient(to right, #5e2d91 0%, #5e2d91 ${progressPercent}%, #4f4c52 ${progressPercent}%, #4f4c52 100%)`
            }}
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <FontAwesomeIcon icon={faListUl} className="player-icon" />
        <FontAwesomeIcon icon={faVolumeUp} className="player-icon" />
        <div style={{ position: 'relative', width: '100px' }}>
          {showVolumeTooltip && (
            <div
              style={{
                position: 'absolute',
                left: volumeTooltipX,
                transform: 'translateX(-50%)',
                bottom: '150%',
                background: '#333',
                color: '#fff',
                padding: '2px 6px',
                fontSize: '0.75rem',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              {volume}%
            </div>
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
            style={{
              background: `linear-gradient(to right, #5e2d91 0%, #5e2d91 ${volume}%, #4f4c52 ${volume}%, #4f4c52 100%)`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SongPlayer;
