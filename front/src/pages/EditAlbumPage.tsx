import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        (a.musics || []).map((t) => ({
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

  useEffect(() => {
    load();
  }, [albumId]);

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
    setTracks((prev) => prev.map((t) => (t.id === tid ? { ...t, _title: val } : t)));
  };

  const onTrackAudioChange = (tid: number, f: File | null) => {
    setTracks((prev) => prev.map((t) => (t.id === tid ? { ...t, _audioFile: f } : t)));
  };

  const toggleDeleteTrack = (tid: number) => {
    setTracks((prev) => prev.map((t) => (t.id === tid ? { ...t, _deleted: !t._deleted } : t)));
  };

  const addNewTrackRow = () => {
    setNewTracks((prev) => [...prev, { title: '', audio: null }]);
  };

  const removeNewTrackRow = (idx: number) => {
    setNewTracks((prev) => prev.filter((_, i) => i !== idx));
  };

  const onNewTrackTitle = (idx: number, v: string) => {
    setNewTracks((prev) => prev.map((t, i) => (i === idx ? { ...t, title: v } : t)));
  };

  const onNewTrackAudio = (idx: number, f: File | null) => {
    setNewTracks((prev) => prev.map((t, i) => (i === idx ? { ...t, audio: f } : t)));
  };

  const emitTracksUpdatedFromAlbum = (a: Album) => {
    const updates = (a.musics || []).map((m) => ({
      id: Number(m.id),
      name: m.title,
      artist: m.artist_name || a.artist_name || t('search.unknown'),
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

      const toDelete = tracks.filter((track) => track._deleted);
      const deletedIds: number[] = [];
      for (const track of toDelete) {
        try {
          await deleteTrack(track.id);
          deletedIds.push(Number(track.id));
        } catch {}
      }
      if (deletedIds.length) {
        window.dispatchEvent(new CustomEvent('tracks:deleted', { detail: { ids: deletedIds } }));
      }

      const toUpdate = tracks.filter(
        (track) => !track._deleted && ((track._title && track._title !== track.title) || !!track._audioFile)
      );
      for (const track of toUpdate) {
        const fd = new FormData();
        if (track._title && track._title !== track.title) fd.append('title', track._title);
        if (track._audioFile) fd.append('audio', track._audioFile);
        await updateTrack(track.id, fd);
      }

      const toAdd = newTracks.filter((nt) => nt.title.trim() && nt.audio);
      for (const nt of toAdd) {
        const fd = new FormData();
        fd.append('title', nt.title.trim());
        fd.append('audio', nt.audio as File);
        await addTrackToAlbum(albumId, fd);
      }

      const fresh = await getAlbumById(albumId);
      emitTracksUpdatedFromAlbum(fresh);
      window.dispatchEvent(new Event('library:changed'));
      navigate(`/album/${albumId}`);
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
        <div className="import-content"><h2>{t('common.loading')}</h2></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="import-page">
        <div className="import-content"><h2>{t('editAlbum.albumNotFound')}</h2></div>
      </div>
    );
  }

  return (
    <div className="import-page">
      <div className="import-content">
        <h2>{t('editAlbum.title')}</h2>

        <div className="form-section">
          <h3>{t('editAlbum.albumInfo')}</h3>

          <div className="import-form">
            <label htmlFor="album-title">{t('editAlbum.albumTitle')}</label>
            <input
              id="album-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('editAlbum.albumName')}
            />
          </div>

          <div className="import-form">
            <label htmlFor="album-image">{t('editAlbum.albumImage')}</label>
            <input id="album-image" type="file" accept="image/*" onChange={onAlbumImageChange} />
            <small style={{ opacity: 0.8 }}>
              {t('editAlbum.imageAppliesAll')}
            </small>
          </div>
        </div>

        <div className="form-section" style={{ marginTop: 24 }}>
          <h3>{t('editAlbum.tracks')}</h3>

          {(tracks || []).map((track) => {
            const hasAudio = Boolean(track.audio);
            const chosen = track._audioFile?.name;
            const audioLabel = hasAudio ? t('editAlbum.changeFile') : t('editAlbum.chooseFile');

            const rowStyle: React.CSSProperties = track._deleted
              ? { opacity: 0.5, filter: 'grayscale(1)' }
              : {};

            return (
              <div className="song-item" key={track.id} style={rowStyle}>
                <input
                  type="text"
                  placeholder={t('editAlbum.trackTitle')}
                  value={track._title ?? ''}
                  onChange={(e) => onTrackTitleChange(track.id, e.target.value)}
                  disabled={track._deleted}
                />

                <div className="import-form" style={{ margin: 0 }}>
                  <label htmlFor={`track-audio-${track.id}`}>{audioLabel}</label>
                  <input
                    id={`track-audio-${track.id}`}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => onTrackAudioChange(track.id, e.target.files?.[0] ?? null)}
                    disabled={track._deleted}
                  />
                </div>

                <button
                  className="remove-btn"
                  onClick={() => toggleDeleteTrack(track.id)}
                >
                  {track._deleted ? t('editAlbum.cancelDeletion') : t('common.delete')}
                </button>
              </div>
            );
          })}

          <h3 style={{ marginTop: 24 }}>{t('editAlbum.addTracks')}</h3>

          {newTracks.map((nt, idx) => (
            <div className="song-item" key={idx}>
              <input
                type="text"
                placeholder={t('editAlbum.trackTitleRequired')}
                value={nt.title}
                onChange={(e) => onNewTrackTitle(idx, e.target.value)}
              />
              <div className="import-form" style={{ margin: 0 }}>
                <label htmlFor={`new-track-audio-${idx}`}>{t('editAlbum.chooseFileRequired')}</label>
                <input
                  id={`new-track-audio-${idx}`}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => onNewTrackAudio(idx, e.target.files?.[0] ?? null)}
                />
              </div>

              {newTracks.length > 1 && (
                <button className="remove-btn" onClick={() => removeNewTrackRow(idx)}>
                  {t('editAlbum.removeThisRow')}
                </button>
              )}
            </div>
          ))}

          <button className="add-song-btn" onClick={addNewTrackRow}>
            {t('editAlbum.addRow')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={saveAll} disabled={savingAll}>
            {savingAll ? t('editAlbum.saving') : t('common.save')}
          </button>
          <button className="remove-btn" onClick={removeAlbum} disabled={deletingAlbum}>
            {deletingAlbum ? t('editAlbum.deleting') : t('editAlbum.deleteAlbum')}
          </button>
          <button onClick={() => navigate(`/album/${albumId}`)}>
            ← {t('editAlbum.backToAlbum')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAlbumPage;
