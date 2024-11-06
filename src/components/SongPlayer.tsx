import React, { useState, useEffect } from 'react';
import '../styles/SongPlayer.css';

interface SongPlayerProps {
  audioUrl: string;
}

const SongPlayer: React.FC<SongPlayerProps> = ({ audioUrl }) => {
  const [audio] = useState(new Audio(audioUrl));
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    isPlaying ? audio.play() : audio.pause();
  }, [isPlaying, audio]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="song-player">
      <button onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default SongPlayer;
