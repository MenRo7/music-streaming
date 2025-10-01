import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTrash, faPlay, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import DropdownMenu from '../components/DropdownMenu';
import PlaylistCheckboxMenu from '../components/PlaylistCheckboxMenu';
import { usePlayer } from '../apis/PlayerContext';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import '../styles/MusicQueue.css';

type WithPlaylistIds = {
  playlistIds?: number[] | (number | string)[];
  playlist_ids?: number[] | (number | string)[];
  playlists?: number[] | (number | string)[];
};

const DEFAULT_IMAGE = '/default-playlist-image.png';

const toNumberArray = (arr: any[]): number[] =>
  (Array.isArray(arr) ? arr : []).map((v) => Number(v)).filter((n) => Number.isFinite(n));

const MusicQueue: React.FC = () => {
  const {
    currentItem,
    upNext,
    queueManual,
    queueAuto,
    clearQueue,
    removeFromQueue,
    playNowFromQueue,
    moveManual,
    isHydrating,
  } = usePlayer();

  const [queuePlaylists, setQueuePlaylists] = useState<Record<string, number[]>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const [isOpen, setIsOpen] = useState(true);
  useEffect(() => {
    const onToggle = (e: Event) => {
      const ce = e as CustomEvent<{ open?: boolean }>;
      if (typeof ce.detail?.open === 'boolean') setIsOpen(ce.detail.open);
      else setIsOpen((v) => !v);
    };
    window.addEventListener('queue:toggle', onToggle as EventListener);
    return () => window.removeEventListener('queue:toggle', onToggle as EventListener);
  }, []);

  useEffect(() => {
    const onExternalUpdate = (e: Event) => {
      const ce = e as CustomEvent<any>;
      const { trackId, playlistIds } = ce.detail || {};
      if (!Number.isFinite(trackId)) return;

      const mapUpdates: Record<string, number[]> = {};
      if (currentItem && Number((currentItem as any).id) === Number(trackId)) {
        mapUpdates[currentItem.qid] = (playlistIds || []).map(Number);
      }
      queueManual.forEach((t) => {
        if (Number((t as any).id) === Number(trackId)) {
          mapUpdates[t.qid] = (playlistIds || []).map(Number);
        }
      });
      queueAuto.forEach((t) => {
        if (Number((t as any).id) === Number(trackId)) {
          mapUpdates[t.qid] = (playlistIds || []).map(Number);
        }
      });

      if (Object.keys(mapUpdates).length) {
        setQueuePlaylists((prev) => ({ ...prev, ...mapUpdates }));
      }
    };

    window.addEventListener('track:playlist-updated', onExternalUpdate as EventListener);
    return () => window.removeEventListener('track:playlist-updated', onExternalUpdate as EventListener);
  }, [currentItem?.qid, queueManual.length, queueAuto.length]);

  const isInteractive = (el: HTMLElement | null): boolean =>
    !!el?.closest('button, [role="button"], a, input, textarea, select, .mq-cover-play, .dropdown-wrapper');

  // ✅ robuste : respecte override [] et lit plusieurs clés
  const getExistingIds = (t: unknown, qid: string): number[] => {
    if (Object.prototype.hasOwnProperty.call(queuePlaylists, qid)) {
      return toNumberArray(queuePlaylists[qid]);
    }

    if (t && typeof t === 'object') {
      const anyT = t as WithPlaylistIds;
      const candidates = [
        anyT.playlistIds,
        anyT.playlist_ids,
        anyT.playlists,
      ];
      for (const c of candidates) {
        if (Array.isArray(c)) return toNumberArray(c);
      }
    }

    return [];
  };

  const togglePlaylist = async (
    qid: string,
    trackIdInput: number | string,
    playlistIdInput: number | string,
    checked: boolean,
    baseIdsInput: (number | string)[]
  ) => {
    const trackId = Number(trackIdInput);
    const pid = Number(playlistIdInput);
    const baseIds = toNumberArray(baseIdsInput);
    if (!Number.isFinite(trackId) || !Number.isFinite(pid)) return;

    const key = `${qid}:${pid}`;
    if (pending[key]) return;

    setPending((p) => ({ ...p, [key]: true }));

    setQueuePlaylists((prev) => {
      const cur = toNumberArray(prev[qid] ?? baseIds);
      const next = checked
        ? cur.includes(pid) ? cur : [...cur, pid]
        : cur.filter((id) => id !== pid);

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('track:playlist-updated', {
            detail: { trackId: Number(trackId), playlistIds: next.map(Number) },
          })
        );
      }, 0);

      return { ...prev, [qid]: next };
    });

    try {
      if (checked) await addMusicToPlaylist(pid, trackId);
      else await removeMusicFromPlaylist(pid, trackId);
    } catch (err) {
      console.error('Erreur maj playlist', { err, qid, trackId, pid, checked });
      setQueuePlaylists((prev) => {
        const cur = toNumberArray(prev[qid] ?? baseIds);
        const rollback = checked
          ? cur.filter((id) => id !== pid)
          : cur.includes(pid) ? cur : [...cur, pid];

        window.dispatchEvent(
          new CustomEvent('track:playlist-updated', {
            detail: { trackId: Number(trackId), playlistIds: rollback.map(Number) },
          })
        );

        return { ...prev, [qid]: rollback };
      });
    } finally {
      setPending((p) => {
        const { [key]: _, ...rest } = p;
        return rest;
      });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    if (isInteractive(e.target as HTMLElement)) {
      e.preventDefault();
      return;
    }
    setDragIndex(idx);
    (e.currentTarget as HTMLElement).classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, idx: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== idx) {
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

  if (isHydrating) {
    return (
      <aside className="music-queue" aria-label="File d'attente">
        <div className="mq-header">
          <div className="mq-title">
            <FontAwesomeIcon icon={faList} className="mq-title-icon" />
            <span>File d'attente</span>
          </div>
          <div className="mq-actions">
            <button className="mq-btn mq-btn--icon mq-btn--danger" disabled>
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>

        <div className="mq-empty">
          <p>Chargement de la file…</p>
          <small>Vérification des pistes supprimées…</small>
        </div>
      </aside>
    );
  }

  if (!isOpen) return null;

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
            disabled={queueManual.length + queueAuto.length === 0}
            onClick={() => clearQueue(true)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {!currentItem && queueManual.length === 0 && queueAuto.length === 0 ? (
        <div className="mq-empty">
          <p>Aucune piste dans la file.</p>
          <small>Ajoutez des chansons via “Ajouter à la file d’attente”.</small>
        </div>
      ) : (
        <div className="mq-sections" role="list">
          {currentItem && (
            <ul className="mq-list">
              <li className="mq-item mq-item--current" draggable={false}>
                <div className="mq-cover-wrap">
                  {currentItem.album_image ? (
                    <img
                      key={`current-${currentItem.qid}`}
                      src={currentItem.album_image}
                      alt=""
                      className="mq-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                      }}
                    />
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
            </ul>
          )}

          {/* File d’attente manuelle */}
          <div className="mq-section">
            <div className="mq-section-head">
              <span>Ajoutés à la file d'attente</span>
              <small>{queueManual.length}</small>
            </div>
            <ul className="mq-list">
              {queueManual.map((t, idx) => {
                const existingIdsRaw = getExistingIds(t, t.qid);
                const normalized = Array.from(new Set(existingIdsRaw.map(Number))).filter(Number.isFinite) as number[];
                const idsKey = normalized.slice().sort((a, b) => a - b).join('_');

                return (
                  <li
                    key={t.qid}
                    className={`mq-item draggable ${overIndex === idx ? 'drag-over' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnter={() => setOverIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    title="Ajouté manuellement"
                  >
                    <div className="mq-cover-wrap">
                      {t.album_image ? (
                        <img
                          key={`queue-${t.qid}`}
                          src={t.album_image}
                          alt=""
                          className="mq-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                          }}
                        />
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
                                key={`pcm-${t.qid}-${idsKey}`}
                                existingPlaylistIds={normalized}
                                onToggle={(playlistId, checked) => {
                                  const tid = Number((t as any).id);
                                  if (!Number.isFinite(tid)) return;
                                  togglePlaylist(t.qid, tid, Number(playlistId), checked, normalized);
                                }}
                              />
                            ),
                          },
                          { label: 'Supprimer de la file d’attente', onClick: () => removeFromQueue(t.qid) },
                        ]}
                      />
                    </div>
                  </li>
                );
              })}
              {queueManual.length === 0 && (
                <li className="mq-empty-row">Aucun titre ajouté manuellement.</li>
              )}
            </ul>
          </div>

          {/* File automatique */}
          <div className="mq-section">
            <div className="mq-section-head">
              <span>À lire à la suite</span>
              <small>{queueAuto.length}</small>
            </div>
            <ul className="mq-list">
              {queueAuto.map((t) => {
                const existingIdsRaw = getExistingIds(t, t.qid);
                const normalized = Array.from(new Set(existingIdsRaw.map(Number))).filter(Number.isFinite) as number[];
                const idsKey = normalized.slice().sort((a, b) => a - b).join('_');

                return (
                  <li key={t.qid} className="mq-item" draggable={false} title="Ajouté automatiquement">
                    <div className="mq-cover-wrap">
                      {t.album_image ? (
                        <img
                          key={`queue-${t.qid}`}
                          src={t.album_image}
                          alt=""
                          className="mq-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                          }}
                        />
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
                                key={`pcm-${t.qid}-${idsKey}`}
                                existingPlaylistIds={normalized}
                                onToggle={(playlistId, checked) => {
                                  const tid = Number((t as any).id);
                                  if (!Number.isFinite(tid)) return;
                                  togglePlaylist(t.qid, tid, Number(playlistId), checked, normalized);
                                }}
                              />
                            ),
                          },
                          { label: 'Supprimer de la file d’attente', onClick: () => removeFromQueue(t.qid) },
                        ]}
                      />
                    </div>
                  </li>
                );
              })}
              {queueAuto.length === 0 && (
                <li className="mq-empty-row">Aucun titre ajouté automatiquement.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </aside>
  );
};

export default MusicQueue;
