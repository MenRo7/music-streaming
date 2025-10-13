import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../apis/api';
import { createMusic } from '../apis/MusicService';
import { useNavigate } from 'react-router-dom';

import '../styles/ImportPage.css';

interface Song {
  title: string;
  file: File | null;
}

const ImportPage: React.FC = () => {
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

    const formData = new FormData();
    formData.append('title', musicTitle);
    formData.append('audio', musicFile);
    if (musicImage) formData.append('image', musicImage);

    try {
      await createMusic(formData);
      window.dispatchEvent(new Event('library:changed'));
      navigate('/my-music');
    } catch (error) {
      console.error('Error adding music:', error);
    }
  };

  const submitAlbum = async () => {
    if (!albumName.trim()) return;

    const formData = new FormData();
    formData.append('title', albumName);
    formData.append('type', albumType);
    if (albumImage) formData.append('image', albumImage);

    songs.forEach((song, index) => {
      formData.append(`songs[${index}][title]`, song.title);
      if (song.file) formData.append(`songs[${index}][audio]`, song.file);
      if (albumImage) formData.append(`songs[${index}][image]`, albumImage);
    });

    try {
      await axios.post(`${API_URL}/album`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      window.dispatchEvent(new Event('library:changed'));
      navigate('/my-music');
    } catch (error) {
      console.error('Error adding album:', error);
    }
  };

  return (
    <div className="import-page">
      <div className="import-content">
        <h2>Importer une musique ou un album</h2>

        <div className="form-section">
          <h3>Choisissez le type d'importation</h3>
          <div className="import-form">
            <label htmlFor="import-type">Sélectionnez le type</label>
            <select
              id="import-type"
              value={importType}
              onChange={(e) => setImportType(e.target.value as 'music' | 'album')}
            >
              <option value="music">Musique</option>
              <option value="album">Album</option>
            </select>
          </div>
        </div>

        {importType === 'music' && (
          <div className="form-section">
            <h3>Importer une musique</h3>
            <div className="import-form">
              <label htmlFor="music-title">Titre de la musique</label>
              <input
                id="music-title"
                type="text"
                placeholder="Entrez le titre de la musique"
                value={musicTitle}
                onChange={(e) => setMusicTitle(e.target.value)}
              />
            </div>
            <div className="import-form">
              <label htmlFor="music-file">Fichier audio</label>
              <input
                id="music-file"
                type="file"
                accept="audio/*"
                onChange={(e) => setMusicFile(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <div className="import-form">
              <label htmlFor="music-image">Image de la musique</label>
              <input
                id="music-image"
                type="file"
                onChange={(e) => setMusicImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <button className="submit-btn" onClick={submitMusic}>Ajouter la musique</button>
          </div>
        )}

        {importType === 'album' && (
          <div className="form-section">
            <h3>Importer un album</h3>
            <div className="import-form">
              <label htmlFor="album-name">Nom de l'album</label>
              <input
                id="album-name"
                type="text"
                placeholder="Entrez le nom de l'album"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
              />
            </div>
            <div className="import-form">
              <label htmlFor="album-image">Image de l'album</label>
              <input
                id="album-image"
                type="file"
                onChange={(e) => setAlbumImage(e.target.files ? e.target.files[0] : null)}
              />
            </div>

            <div className="songs-section">
              <h3>Ajouter des morceaux à l'album</h3>
              {songs.map((song, index) => (
                <div className="song-item" key={index}>
                  <input
                    type="text"
                    placeholder="Titre du morceau"
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
                    Supprimer
                  </button>
                </div>
              ))}
              <button className="add-song-btn" onClick={addSong}>Ajouter un morceau</button>
            </div>

            <button className="submit-btn" onClick={submitAlbum}>Ajouter l'album</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPage;
