import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTrash, faPlay, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '../components/DropdownMenu';
import PlaylistCheckboxMenu from '../components/PlaylistCheckboxMenu';
import { usePlayer } from '../apis/PlayerContext';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import '../styles/MusicQueue.css';

type WithPlaylistIds = { playlistIds?: number[] };

const MusicQueue: React.FC = () => {
  const {
    currentItem,
    upNext,
    queueManual,
    clearQueue,
    removeFromQueue,
    playNowFromQueue,
    moveManual,
  } = usePlayer();

  const [queuePlaylists, setQueuePlaylists] = useState<Record<string, number[]>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const manualCount = queueManual.length;
  const isManualIdx = (i: number) => i < manualCount;

  const isInteractive = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    return !!el.closest('button, [role="button"], a, input, textarea, select, .mq-cover-play, .dropdown-wrapper');
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    if (!isManualIdx(idx)) { e.preventDefault(); return; }
    if (isInteractive(e.target as HTMLElement)) { e.preventDefault(); return; }
    setDragIndex(idx);
    (e.currentTarget as HTMLElement).classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    if (!isManualIdx(idx)) return;
    e.preventDefault();
    setOverIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    if (!isManualIdx(idx)) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    e.preventDefault();
    if (dragIndex !== null && isManualIdx(dragIndex) && isManualIdx(idx) && dragIndex !== idx) {
      moveManual(dragIndex, idx);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    (e.currentTarget as HTMLElement).classList.remove('dragging');
    setDragIndex(null);
    setOverIndex(null);
  };

  const getExistingIds = (t: unknown, qid: string): number[] => {
    const override = queuePlaylists[qid];
    if (override) return override;

    if (t && typeof t === 'object') {
      const ids = (t as WithPlaylistIds).playlistIds;
      if (Array.isArray(ids)) return ids;
    }
    return [];
  };

  const togglePlaylist = async (
    qid: string,
    trackId: number,
    playlistId: number,
    checked: boolean,
    baseIds: number[]
  ) => {
    const key = `${qid}:${playlistId}`;
    if (pending[key]) return;

    setPending(p => ({ ...p, [key]: true }));

    setQueuePlaylists(prev => {
      const cur = prev[qid] ?? baseIds;
      const next = checked
        ? (cur.includes(playlistId) ? cur : [...cur, playlistId])
        : cur.filter(id => id !== playlistId);
      return { ...prev, [qid]: next };
    });

    try {
      if (checked) {
        await addMusicToPlaylist(playlistId, trackId);
      } else {
        await removeMusicFromPlaylist(playlistId, trackId);
      }
    } catch (err) {
      console.error('Erreur maj playlist', { err, qid, trackId, playlistId, checked });

      setQueuePlaylists(prev => {
        const cur = prev[qid] ?? baseIds;
        const rollback = checked
          ? cur.filter(id => id !== playlistId)
          : (cur.includes(playlistId) ? cur : [...cur, playlistId]); // on avait retiré => on réajoute
        return { ...prev, [qid]: rollback };
      });
    } finally {
      setPending(p => {
        const { [key]: _, ...rest } = p;
        return rest;
      });
    }
  };

  return (
    <aside className="music-queue" aria-label="File d'attente">
      <div className="mq-header">
        <div className="mq-title">
          <FontAwesomeIcon icon={faList} className="mq-title-icon" />
          <span>File d'attente</span>
        </div>

        <div className="mq-actions">
          <button
            className="mq-btn mq-btn--icon mq-btn--danger"
            aria-label="Vider la file (sauf la piste en cours)"
            title="Vider la file (sauf la piste en cours)"
            disabled={upNext.length === 0}
            onClick={() => clearQueue(true)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {!currentItem && upNext.length === 0 ? (
        <div className="mq-empty">
          <p>Aucune piste dans la file.</p>
          <small>Ajoutez des chansons via “Ajouter à la file d’attente”.</small>
        </div>
      ) : (
        <ul className="mq-list" role="list">
          {currentItem && (
            <li className="mq-item mq-item--current" draggable={false}>
              <div className="mq-cover-wrap">
                {currentItem.album_image ? (
                  <img src={currentItem.album_image} alt="" className="mq-cover" />
                ) : (
                  <div className="mq-cover mq-cover--placeholder" aria-hidden />
                )}
                <button
                  className="mq-cover-play"
                  aria-label="Relire"
                  title="Relire"
                  onClick={() => playNowFromQueue(currentItem.qid)}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              </div>

              <div className="mq-meta">
                <div className="mq-title-row">
                  <span className="mq-track" title={currentItem.name}>
                    {currentItem.name}
                  </span>
                  {currentItem.duration && (
                    <span className="mq-duration">{currentItem.duration}</span>
                  )}
                </div>
                <span className="mq-artist" title={currentItem.artist}>
                  {currentItem.artist}
                </span>
              </div>

              <span className="mq-badge" aria-label="Piste en cours">
                En cours
              </span>
            </li>
          )}

          {upNext.map((t, idx) => {
            const manual = isManualIdx(idx);
            const existingIds = getExistingIds(t, t.qid);

            return (
              <li
                key={t.qid}
                className={`mq-item ${manual ? 'draggable' : ''} ${overIndex === idx ? 'drag-over' : ''}`}
                draggable={manual}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnter={(e) => handleDragEnter(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                title={t.origin === 'manual' ? 'Ajouté manuellement' : 'Automatique'}
              >
                <div className="mq-cover-wrap">
                  {t.album_image ? (
                    <img src={t.album_image} alt="" className="mq-cover" />
                  ) : (
                    <div className="mq-cover mq-cover--placeholder" aria-hidden />
                  )}

                  <button
                    className="mq-cover-play"
                    aria-label="Lire maintenant"
                    title="Lire maintenant"
                    onClick={() => playNowFromQueue(t.qid)}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                </div>

                <div className="mq-meta">
                  <div className="mq-title-row">
                    <span className="mq-track" title={t.name}>
                      {t.name}
                    </span>
                    {t.duration && <span className="mq-duration">{t.duration}</span>}
                  </div>
                  <span className="mq-artist" title={t.artist}>
                    {t.artist}
                  </span>
                </div>

                <div className="mq-row-actions" role="group" aria-label="Actions piste">
                  <DropdownMenu
                    wrapperClassName="mq-ellipsis"
                    trigger={
                      <FontAwesomeIcon
                        icon={faEllipsisV}
                        className="mq-ellipsis-icon"
                        title="Plus d’actions"
                        aria-label="Plus d’actions"
                      />
                    }
                    items={[
                      {
                        label: 'Ajouter à une playlist',
                        onClick: () => {},
                        submenuContent: (
                          <PlaylistCheckboxMenu
                            existingPlaylistIds={existingIds}
                            onToggle={(playlistId, checked) => {
                              if (typeof (t as any).id !== 'number') {
                                console.warn('Track id manquant pour ajout à une playlist', t);
                                return;
                              }
                              togglePlaylist(t.qid, (t as any).id, playlistId, checked, existingIds);
                            }}
                          />
                        ),
                      },
                      { label: 'Supprimer de la file d’attente', onClick: () => removeFromQueue(t.qid) },
                      { label: 'Aller à l’album', onClick: () => console.log('Aller à l’album', t) },
                      { label: 'Voir l’artiste', onClick: () => console.log('Voir l’artiste', t) },
                    ]}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};

export default MusicQueue;
