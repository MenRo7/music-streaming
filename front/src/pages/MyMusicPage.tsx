import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getUserMusics,
  getUserAlbums,
  deleteMusic,
} from '../apis/MyMusicService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import { addFavorite } from '../apis/FavoritesService';
import { usePlayer } from '../apis/PlayerContext';

import PlaylistCard from '../components/PlaylistCard';
import SongList, { UISong } from '../components/SongList';

const toNumberArray = (arr: any[]): number[] =>
  (Array.isArray(arr) ? arr : []).map(Number).filter(Number.isFinite);

const MyMusicPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToQueue } = usePlayer();
  const [musics, setMusics] = useState<UISong[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [musicData, albumData] = await Promise.all([
          getUserMusics(),
          getUserAlbums(),
        ]);

        const formattedSongs: UISong[] = (musicData as any[]).map((m: any) => ({
          id: Number(m.id),
          name: m.name,
          artist: m.artist,
          album: m.album ?? 'Inconnu',
          album_image: m.album_image || '',
          audio: m.audio || '',
          dateAdded: m.date_added ? new Date(m.date_added).toLocaleDateString() : '',
          duration: m.duration ?? undefined,
          playlistIds: toNumberArray(m.playlist_ids || []),
        }));

        setMusics(formattedSongs);
        setAlbums(albumData);
      } catch (error) {
        console.error('Erreur lors du chargement :', error);
      }
    };

    fetchData();
  }, []);

  const handleTogglePlaylist = async (playlistId: number | string, checked: boolean, songId: number | string) => {
    const pid = Number(playlistId);
    const sid = Number(songId);
    if (!Number.isFinite(pid) || !Number.isFinite(sid)) return;

    try {
      if (checked) await addMusicToPlaylist(pid, sid);
      else await removeMusicFromPlaylist(pid, sid);
    } catch {
      alert('Erreur lors de la modification de la playlist.');
    }
  };

  return (
    <div className="media-content">
      <div className="media-page">
        <h2>Ma musique</h2>

        <SongList
          songs={musics}
          showAlbum
          showArtist
          showDateAdded
          showDuration={false}
          getActions={(song) => [
            {
              label: 'Ajouter aux favoris',
              onClick: () => {
                addFavorite(song.id).catch((e) => console.error('Ajout aux favoris échoué', e));
              },
            },
            {
              label: 'Ajouter à une playlist',
              onClick: () => {},
              withPlaylistMenu: true,
              songId: song.id,
              existingPlaylistIds: song.playlistIds ?? [],
              onToggle: (playlistId: number, checked: boolean) =>
                handleTogglePlaylist(playlistId, checked, song.id),
            },
            { label: 'Ajouter à la file d’attente', onClick: () => addToQueue(song) },
            {
              label: 'Modifier la musique',
              onClick: () => navigate(`/edit-music/${song.id}`),
            },
            {
              label: 'Supprimer',
              onClick: async () => {
                try {
                  await deleteMusic(song.id);
                  setMusics((prev) => prev.filter((m) => m.id !== song.id));
                } catch {
                  alert('Erreur lors de la suppression');
                }
              },
            },
          ]}
        />

        <h2 style={{ marginTop: '40px' }}>Mes Albums</h2>
        <div className="album-row">
          {albums.map((album: any) => (
            <PlaylistCard
              key={album.id}
              title={album.title}
              image={album.image}
              onClick={() => navigate(`/album/${album.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyMusicPage;
