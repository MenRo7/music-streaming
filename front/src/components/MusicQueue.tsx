import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTrash, faBars, faPlay, faTimes } from '@fortawesome/free-solid-svg-icons';
import { usePlayer } from '../apis/PlayerContext';
import '../styles/MusicQueue.css';

const MusicQueue: React.FC = () => {
  const {
    currentItem, upNext, queueManual,
    clearQueue, removeFromQueue, playNowFromQueue, moveManual,
  } = usePlayer();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const manualCount = queueManual.length;
  const isManualIdx = (i: number) => i < manualCount;

  return (
    <aside className="music-queue" aria-label="File d'attente">
      <div className="mq-header">
        <div className="mq-title">
          <FontAwesomeIcon icon={faList} className="mq-title-icon" />
          <span>File d'attente</span>
        </div>

        <div className="mq-actions">
          <button
            className="mq-btn"
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
        <ul className="mq-list">
          {currentItem && (
            <li className="mq-item">
              <img src={currentItem.album_image} alt="" className="mq-cover" />
              <div className="mq-meta">
                <div className="mq-title-row">
                  <span className="mq-track">{currentItem.name}</span>
                  {currentItem.duration && <span className="mq-duration">{currentItem.duration}</span>}
                </div>
                <span className="mq-artist">{currentItem.artist}</span>
              </div>
              <span className="mq-badge">En cours</span>
            </li>
          )}

          {upNext.map((t, idx) => (
            <li
              key={t.qid}
              className={`mq-item ${isManualIdx(idx) ? 'draggable' : ''}`}
              draggable={isManualIdx(idx)}
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null && isManualIdx(dragIndex) && isManualIdx(idx)) {
                  moveManual(dragIndex, idx);
                }
                setDragIndex(null);
              }}
              title={t.origin === 'manual' ? 'Ajouté manuellement' : 'Automatique'}
            >
              <img src={t.album_image} alt="" className="mq-cover" />
              <div className="mq-meta">
                <div className="mq-title-row">
                  <span className="mq-track">{t.name}</span>
                  {t.duration && <span className="mq-duration">{t.duration}</span>}
                </div>
                <span className="mq-artist">{t.artist}</span>
              </div>

              <div className="mq-row-actions">
                <button className="mq-btn" title="Lire maintenant" onClick={() => playNowFromQueue(t.qid)}>
                  <FontAwesomeIcon icon={faPlay} />
                </button>
                <button className="mq-btn" title="Retirer de la file" onClick={() => removeFromQueue(t.qid)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
                {isManualIdx(idx) && (
                  <span className="mq-drag-handle" title="Glisser pour réordonner">
                    <FontAwesomeIcon icon={faBars} />
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default MusicQueue;
