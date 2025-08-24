import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faTrash, faBars } from '@fortawesome/free-solid-svg-icons';
import '../styles/MusicQueue.css';

const MusicQueue: React.FC = () => {
  // On gardera la logique (queue réelle, actions) pour la prochaine étape.
  const items: any[] = []; // Placeholder (affiche un état vide propre)

  return (
    <aside className="music-queue" aria-label="File d'attente">
      <div className="mq-header">
        <div className="mq-title">
          <FontAwesomeIcon icon={faList} className="mq-title-icon" />
          <span>File d'attente</span>
        </div>

        <div className="mq-actions">
          <button className="mq-btn" title="Vider la file" disabled>
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mq-empty">
          <p>Aucune piste dans la file.</p>
          <small>Ajoutez des chansons via “Ajouter à la file d’attente”.</small>
        </div>
      ) : (
        <ul className="mq-list">
          {items.map((t, idx) => (
            <li key={idx} className="mq-item">
              <img src={t.cover} alt="" className="mq-cover" />
              <div className="mq-meta">
                <div className="mq-title-row">
                  <span className="mq-track">{t.title}</span>
                  <span className="mq-duration">{t.duration}</span>
                </div>
                <span className="mq-artist">{t.artist}</span>
              </div>
              <button className="mq-drag" title="Réorganiser">
                <FontAwesomeIcon icon={faBars} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default MusicQueue;
