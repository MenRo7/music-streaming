import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_URL } from '../apis/api';
import { createMusic } from '../apis/MusicService';
import { useNavigate } from 'react-router-dom';

import '../styles/ImportPage.css';

interface Song {
  title: string;
  file: File | null;
}

// Helper function to get audio duration from file
const getAudioDuration = (file: File): Promise<number | null> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(Math.round(audio.duration));
    });

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    });

    audio.src = objectUrl;
  });
};

const ImportPage: React.FC = () => {
  const { t } = useTranslation();
  const [albumName, setAlbumName] = useState('');
  const [albumType, setAlbumType] = useState('single');
  const [songs, setSongs] = useState<Song[]>([{ title: '', file: null }]);
  const [albumImage, setAlbumImage] = useState<File | null>(null);
  const [musicTitle, setMusicTitle] = useState('');
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicImage, setMusicImage] = useState<File | null>(null);
  const [importType, setImportType] = useState<'music' | 'album'>('music');

  const navigate = useNavigate();

  const addSong = () => {
    setSongs((prev) => [...prev, { title: '', file: null }]);
  };

  const removeSong = (index: number) => {
    setSongs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSongChange = (index: number, field: keyof Song, value: any) => {
    setSongs((prev) => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const submitMusic = async () => {
    if (!musicTitle.trim() || !musicFile) return;

    // Calculate duration from audio file
    const duration = await getAudioDuration(musicFile);

    const formData = new FormData();
    formData.append('title', musicTitle);
    formData.append('audio', musicFile);
    if (musicImage) formData.append('image', musicImage);
    if (duration) formData.append('duration', duration.toString());

    try {
      await createMusic(formData);
      window.dispatchEvent(new Event('library:changed'));
      navigate('/my-music');
    } catch (error) {
      console.error(t('errors.addingMusic'), error);
    }
  };

  const submitAlbum = async () => {
    if (!albumName.trim()) return;

    const formData = new FormData();
    formData.append('title', albumName);
    formData.append('type', albumType);
    if (albumImage) formData.append('image', albumImage);

    // Calculate durations for all songs
    for (let index = 0; index < songs.length; index++) {
      const song = songs[index];
      formData.append(`songs[${index}][title]`, song.title);
      if (song.file) {
        formData.append(`songs[${index}][audio]`, song.file);
        const duration = await getAudioDuration(song.file);
        if (duration) formData.append(`songs[${index}][duration]`, duration.toString());
      }
      if (albumImage) formData.append(`songs[${index}][image]`, albumImage);
    }

    try {
      await axios.post(`${API_URL}/album`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      window.dispatchEvent(new Event('library:changed'));
      navigate('/my-music');
    } catch (error) {
      console.error(t('errors.addingAlbum'), error);
    }
  };

  return (
    <div className="import-page">
      <div className="import-content">
        <h2>{t('import.title')}</h2>

        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <div className="form-section">
          <h3>{t('import.chooseType')}</h3>
          <div className="import-form">
            <label htmlFor="import-type">{t('import.selectType')}</label>
            <select
              id="import-type"
              value={importType}
              onChange={(e) => setImportType(e.target.value as 'music' | 'album')}
            >
              <option value="music">{t('import.music')}</option>
              <option value="album">{t('import.album')}</option>
            </select>
          </div>
        </div>

        {importType === 'music' && (
          /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
          <div className="form-section">
            <h3>{t('import.importMusic')}</h3>
            <div className="import-form">
              <label htmlFor="music-title">{t('import.musicTitle')}</label>
              <input
                id="music-title"
                type="text"
                placeholder={t('import.enterMusicTitle')}
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
              />
            </div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <div className="import-form">
              <label htmlFor="music-file">{t('import.audioFile')}</label>
              <input
                id="music-file"
                type="file"
                accept="audio/*"
                onChange={(e) => setMusicFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <div className="import-form">
              <label htmlFor="music-image">{t('import.musicImage')}</label>
              <input
                id="music-image"
                type="file"
                onChange={(e) => setMusicImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <button className="submit-btn" onClick={submitMusic}>{t('import.addMusic')}</button>
          </div>
        )}

        {importType === 'album' && (
          /* eslint-disable-next-line jsx-a11y/label-has-associated-control */
          <div className="form-section">
            <h3>{t('import.importAlbum')}</h3>
            <div className="import-form">
              <label htmlFor="album-name">{t('import.albumName')}</label>
              <input
                id="album-name"
                type="text"
                placeholder={t('import.enterAlbumName')}
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
              />
            </div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <div className="import-form">
              <label htmlFor="album-image">{t('import.albumImage')}</label>
              <input
                id="album-image"
                type="file"
                onChange={(e) => setAlbumImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>

            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <div className="songs-section">
              <h3>{t('import.addTracks')}</h3>
              {songs.map((song, index) => (
                <div className="song-item" key={index}>
                  <input
                    type="text"
                    placeholder={t('import.trackTitle')}
                    value={song.title}
                    onChange={(e) => handleSongChange(index, 'title', e.target.value)}
                  />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) =>
                      handleSongChange(index, 'file', e.target.files ? e.target.files[0] : null)
                    }
                  />
                  <button
                    className="remove-btn"
                    onClick={() => removeSong(index)}
                  >
                    {t('common.delete')}
                  </button>
                </div>
              ))}
              <button className="add-song-btn" onClick={addSong}>{t('import.addTrack')}</button>
            </div>

            <button className="submit-btn" onClick={submitAlbum}>{t('import.addAlbum')}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPage;
