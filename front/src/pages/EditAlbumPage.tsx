import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  getAlbumById,
  updateAlbum,
  deleteAlbum,
  addTrackToAlbum,
  updateTrack,
  deleteTrack,
  Album,
  AlbumMusic,
} from '../apis/AlbumService';

import '../styles/ImportPage.css';

type EditTrack = AlbumMusic & {
  _title?: string;
  _audioFile?: File | null;
  _deleted?: boolean;
};

type NewTrack = {
  title: string;
  audio: File | null;
};

const toDurationStr = (v?: string | number | null) => {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  const sec = Math.max(0, Math.floor(v));
  const mm = Math.floor(sec / 60).toString().padStart(2, '0');
  const ss = (sec % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
};

const EditAlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const albumId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<Album | null>(null);

  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [tracks, setTracks] = useState<EditTrack[]>([]);

  const [newTracks, setNewTracks] = useState<NewTrack[]>([
    { title: '', audio: null },
  ]);

  const [savingAll, setSavingAll] = useState(false);
  const [deletingAlbum, setDeletingAlbum] = useState(false);

  const load = async () => {
    if (!albumId) return;
    try {
      setLoading(true);
      const a = await getAlbumById(albumId);
      setAlbum(a);
      setTitle(a.title || '');
      setImageFile(null);
      setTracks(
        (a.musics || []).map(t => ({
          ...t,
          _title: t.title,
          _audioFile: null,
          _deleted: false,
        }))
      );
      setNewTracks([{ title: '', audio: null }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [albumId]);

  const albumMetaChanged = useMemo(() => {
    if (!album) return false;
    const titleChanged = (title || '') !== (album.title || '');
    const imageChanged = !!imageFile;
    return titleChanged || imageChanged;
  }, [album, title, imageFile]);

  const onAlbumImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setImageFile(f);
  };

  const onTrackTitleChange = (tid: number, val: string) => {
    setTracks(prev => prev.map(t => t.id === tid ? { ...t, _title: val } : t));
  };

  const onTrackAudioChange = (tid: number, f: File | null) => {
    setTracks(prev => prev.map(t => t.id === tid ? { ...t, _audioFile: f } : t));
  };

  const toggleDeleteTrack = (tid: number) => {
    setTracks(prev => prev.map(t => t.id === tid ? { ...t, _deleted: !t._deleted } : t));
  };

  const addNewTrackRow = () => {
    setNewTracks(prev => [...prev, { title: '', audio: null }]);
  };

  const removeNewTrackRow = (idx: number) => {
    setNewTracks(prev => prev.filter((_, i) => i !== idx));
  };

  const onNewTrackTitle = (idx: number, v: string) => {
    setNewTracks(prev => prev.map((t, i) => i === idx ? { ...t, title: v } : t));
  };

  const onNewTrackAudio = (idx: number, f: File | null) => {
    setNewTracks(prev => prev.map((t, i) => i === idx ? { ...t, audio: f } : t));
  };

  const emitTracksUpdatedFromAlbum = (a: Album) => {
    const updates = (a.musics || []).map(m => ({
      id: Number(m.id),
      name: m.title,
      artist: m.artist_name || a.artist_name || 'Inconnu',
      album: a.title,
      album_image: (a.image || m.image || '') || undefined,
      audio: m.audio || '',
      duration: toDurationStr(m.duration),
    }));
    window.dispatchEvent(new CustomEvent('tracks:updated', { detail: { tracks: updates } }));
  };

  const saveAll = async () => {
    try {
      setSavingAll(true);

      if (albumMetaChanged) {
        const fd = new FormData();
        fd.append('title', title);
        if (imageFile) fd.append('image', imageFile);
        await updateAlbum(albumId, fd);
      }

      const toDelete = tracks.filter(t => t._deleted);
      const deletedIds: number[] = [];
      for (const t of toDelete) {
        try {
          await deleteTrack(t.id);
          deletedIds.push(Number(t.id));
        } catch {}
      }
      if (deletedIds.length) {
        window.dispatchEvent(new CustomEvent('tracks:deleted', { detail: { ids: deletedIds } }));
      }

      const toUpdate = tracks.filter(t =>
        !t._deleted && ((t._title && t._title !== t.title) || !!t._audioFile)
      );
      for (const t of toUpdate) {
        const fd = new FormData();
        if (t._title && t._title !== t.title) fd.append('title', t._title);
        if (t._audioFile) fd.append('audio', t._audioFile);
        await updateTrack(t.id, fd);
      }

      const toAdd = newTracks.filter(nt => nt.title.trim() && nt.audio);
      for (const nt of toAdd) {
        const fd = new FormData();
        fd.append('title', nt.title.trim());
        fd.append('audio', nt.audio as File);
        await addTrackToAlbum(albumId, fd);
      }

      const fresh = await getAlbumById(albumId);
      emitTracksUpdatedFromAlbum(fresh);

      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAll(false);
    }
  };

  const removeAlbum = async () => {
    try {
      setDeletingAlbum(true);
      const res = await deleteAlbum(albumId);
      // si l’API renvoie les ids supprimés (voir controller) ⇒ purge queue
      const ids: number[] = Array.isArray(res?.deleted_track_ids) ? res.deleted_track_ids : [];
      if (ids.length) {
        window.dispatchEvent(new CustomEvent('tracks:deleted', { detail: { ids } }));
      }
      navigate('/my-music');
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingAlbum(false);
    }
  };

  if (loading) {
    return (
      <div className="import-page">
        <div className="import-content"><h2>Chargement…</h2></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="import-page">
        <div className="import-content"><h2>Album introuvable.</h2></div>
      </div>
    );
  }

  return (
    <div className="import-page">
      <div className="import-content">
        <h2>Modifier l’album</h2>

        <div className="form-section">
          <h3>Infos de l’album</h3>

          <div className="import-form">
            <label>Titre</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nom de l’album"
            />
          </div>

          <div className="import-form">
            <label>Image de l’album</label>
            <input type="file" accept="image/*" onChange={onAlbumImageChange} />
            <small style={{opacity:.8}}>
              Cette image s’applique automatiquement à toutes les musiques de l’album.
            </small>
          </div>
        </div>

        <div className="form-section" style={{ marginTop: 24 }}>
          <h3>Titres</h3>

          {(tracks || []).map(t => {
            const hasAudio = Boolean(t.audio);
            const chosen = t._audioFile?.name;
            const audioLabel = hasAudio ? 'Modifier le fichier' : 'Choisir un fichier';
            const audioInfo = chosen
              ? chosen
              : hasAudio
              ? 'Fichier actuel présent'
              : 'Aucun fichier sélectionné';

            const rowStyle: React.CSSProperties = t._deleted
              ? { opacity: 0.5, filter: 'grayscale(1)' }
              : {};

            return (
              <div className="song-item" key={t.id} style={rowStyle}>
                <input
                  type="text"
                  placeholder="Titre du morceau"
                  value={t._title ?? ''}
                  onChange={e => onTrackTitleChange(t.id, e.target.value)}
                  disabled={t._deleted}
                />

                <div className="import-form" style={{margin:0}}>
                  <label>{audioLabel}</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={e => onTrackAudioChange(t.id, e.target.files?.[0] ?? null)}
                    disabled={t._deleted}
                  />
                  <small style={{opacity:.8, display:'block', marginTop:6}}>
                    {audioInfo}
                  </small>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => toggleDeleteTrack(t.id)}
                >
                  {t._deleted ? 'Annuler la suppression' : 'Supprimer'}
                </button>
              </div>
            );
          })}

          <h3 style={{ marginTop: 24 }}>Ajouter des titres</h3>

          {newTracks.map((nt, idx) => (
            <div className="song-item" key={idx}>
              <input
                type="text"
                placeholder="Titre du morceau *"
                value={nt.title}
                onChange={e => onNewTrackTitle(idx, e.target.value)}
              />
              <div className="import-form" style={{margin:0}}>
                <label>Choisir un fichier *</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => onNewTrackAudio(idx, e.target.files?.[0] ?? null)}
                />
                <small style={{opacity:.8, display:'block', marginTop:6}}>
                  {nt.audio ? nt.audio.name : 'Aucun fichier'}
                </small>
              </div>

              {newTracks.length > 1 && (
                <button className="remove-btn" onClick={() => removeNewTrackRow(idx)}>
                  Retirer cette ligne
                </button>
              )}
            </div>
          ))}

          <button className="add-song-btn" onClick={addNewTrackRow}>
            Ajouter une ligne
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={saveAll} disabled={savingAll}>
            {savingAll ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button className="remove-btn" onClick={removeAlbum} disabled={deletingAlbum}>
            {deletingAlbum ? 'Suppression…' : 'Supprimer l’album'}
          </button>
          <button onClick={() => navigate(`/album/${albumId}`)}>
            ← Retour à l’album
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAlbumPage;
