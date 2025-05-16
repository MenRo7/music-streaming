import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay, faPause, faStepBackward, faStepForward,
  faRedo, faListUl, faVolumeUp, faPlus
} from '@fortawesome/free-solid-svg-icons';

import '../styles/SongPlayer.css';

interface SongPlayerProps {
  audioUrl: string;
  title?: string;
  artist?: string;
}

const SongPlayer: React.FC<SongPlayerProps> = ({ audioUrl, title, artist }) => {
  const audioRef = useRef(new Audio(audioUrl));
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false);
const [volumeTooltipX, setVolumeTooltipX] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    const setAudioData = () => {
      setDuration(audio.duration);
      setProgress(audio.currentTime);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', setAudioData);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', setAudioData);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    audio.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const vol = Number(e.target.value);
    audio.volume = vol / 100;
    setVolume(vol);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleVolumeMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const slider = e.currentTarget;
    const rect = slider.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const clampedPercent = Math.max(0, Math.min(1, percent));
    setVolumeTooltipX(clampedPercent * rect.width);
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="song-player">
      <div className="player-left">
        <div className="song-info">
          <p className="song-title">{title || 'Aucun titre'}</p>
          <p className="song-artist">{artist || 'Artiste inconnu'}</p>
        </div>
        <FontAwesomeIcon icon={faPlus} className="player-icon" title="Ajouter à la playlist" />
      </div>

      <div className="player-center">
        <FontAwesomeIcon icon={faStepBackward} className="player-icon" title="Précédent" />
        <FontAwesomeIcon
          icon={isPlaying ? faPause : faPlay}
          className="player-icon main-control"
          onClick={togglePlay}
          title={isPlaying ? "Pause" : "Lecture"}
        />
        <FontAwesomeIcon icon={faStepForward} className="player-icon" title="Suivant" />
        <FontAwesomeIcon icon={faRedo} className="player-icon" title="Répéter" />
        <FontAwesomeIcon icon={faListUl} className="player-icon" title="File d'attente" />

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
        <FontAwesomeIcon icon={faVolumeUp} className="player-icon" title="Volume" />
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
