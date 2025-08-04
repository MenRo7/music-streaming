import React, { useState } from 'react';
import '../styles/ImportPage.css';

interface Song {
  title: string;
  file: File | null;
}

const ImportPage = () => {
  const [albumName, setAlbumName] = useState('');
  const [albumType, setAlbumType] = useState('single');
  const [songs, setSongs] = useState<Song[]>([{ title: '', file: null }]);
  const [albumImage, setAlbumImage] = useState<File | null>(null);
  const [importType, setImportType] = useState<'music' | 'album'>('music'); // Type importé

  const addSong = () => {
    setSongs([...songs, { title: '', file: null }]);
  };

  const removeSong = (index: number) => {
    const updatedSongs = songs.filter((_, idx) => idx !== index);
    setSongs(updatedSongs);
  };

  const handleSongChange = (index: number, field: keyof Song, value: any) => {
    const updatedSongs = [...songs];
    updatedSongs[index][field] = value;
    setSongs(updatedSongs);
  };

  return (
    <div className="import-page">
      <div className="import-content">
        <h2>Importer une musique ou un album</h2>

        <div className="form-section">
          <h3>Choisissez le type d'importation</h3>
          <div className="import-form">
            <label>Sélectionnez le type</label>
            <select 
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
              <label>Titre de la musique</label>
              <input
                type="text"
                placeholder="Entrez le titre de la musique"
              />
            </div>
            <div className="import-form">
              <label>Fichier audio</label>
              <input type="file" accept="audio/*" />
            </div>
            <button className="submit-btn">Importer</button>
          </div>
        )}

        {importType === 'album' && (
          <div className="form-section">
            <h3>Importer un album</h3>
            <div className="import-form">
              <label>Nom de l'album</label>
              <input
                type="text"
                placeholder="Entrez le nom de l'album"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
              />
            </div>
            <div className="import-form">
              <label>Type de l'album</label>
              <select
                value={albumType}
                onChange={(e) => setAlbumType(e.target.value)}
              >
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album">Album</option>
                <option value="compilation">Compilation</option>
              </select>
            </div>
            <div className="import-form">
              <label>Image de l'album</label>
              <input
                type="file"
                accept="image/*"
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
                    onChange={(e) => handleSongChange(index, 'file', e.target.files ? e.target.files[0] : null)}
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

            <button className="submit-btn">Importer l'album</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportPage;
