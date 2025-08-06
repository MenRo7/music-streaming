/* import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getAlbumById, Album } from '../apis/AlbumService';

import MediaPage from './MediaPage';

const AlbumPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);

  useEffect(() => {
    if (!id) return;
    getAlbumById(id)
      .then(setAlbum)
      .catch(err => console.error('Erreur de chargement de l’album:', err));
  }, [id]);

  return (
    <MediaPage
      title={album?.title || ''}
      artist={album?.artist_name || ''}
      image={album?.image || ''}
      songs={album?.songs || []}
      isPlaylist={false}
    />
  );
};

export default AlbumPage;
 */