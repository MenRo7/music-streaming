import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPlaylist, updatePlaylist } from '../apis/PlaylistService';

import '../styles/CreateEditPlaylistModal.css';
import { useNavigate } from 'react-router-dom';

interface CreateEditPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { title: string; image?: string; id: number };
  mode?: 'create' | 'edit';
}

const CreateEditPlaylistModal: React.FC<CreateEditPlaylistModalProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialData?.title || '');
  const [image, setImage] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!title.trim()) {
      return;
    }
  
    const formData = new FormData();
    formData.append('title', title);
    if (image) {
      formData.append('image', image);
    }
  
    try {
      if (mode === 'create') {
        const created = await createPlaylist(formData);
        onClose();
      if (created?.playlist?.id) {
        navigate(`/playlist/${created.playlist.id}`);
      }
      } else if (mode === 'edit' && initialData?.id) {
        await updatePlaylist(initialData.id, formData);
      }
      onClose();
    } catch (error) {
      console.error(t('errors.playlistCreateUpdate'), error);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setTitle(initialData.title);
        setImage(null);
      } else {
        setTitle('');
        setImage(null);
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{mode === 'edit' ? t('playlist.editPlaylist') : t('playlist.createPlaylist')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">{t('playlist.title')}</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">{t('playlist.image')}</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="modal-actions">
            <button type="submit">{mode === 'edit' ? t('common.save') : t('common.create')}</button>
            <button type="button" onClick={onClose} className="cancel-btn">
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditPlaylistModal;
