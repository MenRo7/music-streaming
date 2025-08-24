import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  getUserMusics,
  getUserAlbums,
  deleteMusic,
} from '../apis/MyMusicService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import { usePlayer } from '../apis/PlayerContext';

import PlaylistCard from '../components/PlaylistCard';
import SongList from '../components/SongList';

const MyMusicPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToQueue } = usePlayer();
  const [musics, setMusics] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [musicData, albumData] = await Promise.all([
          getUserMusics(),
          getUserAlbums(),
        ]);

        const formattedSongs = musicData.map((music: any) => ({
          id: music.id,
          name: music.title,
          artist: music.artist_name,
          album: albumData.find((a: any) => a.id === music.album_id)?.title || 'Inconnu',
          album_image: music.image || '',
          audio: music.audio || '',
          dateAdded: new Date(music.created_at).toLocaleDateString(),
          playlistIds: music.playlist_ids || [],
        }));

        setMusics(formattedSongs);
        setAlbums(albumData);
      } catch (error) {
        console.error('Erreur lors du chargement :', error);
      }
    };

    fetchData();
  }, []);

  const handleTogglePlaylist = async (playlistId: number, checked: boolean, songId: number) => {
    try {
      if (checked) {
        await addMusicToPlaylist(playlistId, songId);
      } else {
        await removeMusicFromPlaylist(playlistId, songId);
      }
    } catch (error) {
      alert("Erreur lors de la modification de la playlist.");
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
              label: 'Ajouter à une playlist',
              onClick: () => {},
              withPlaylistMenu: true,
              songId: song.id,
              existingPlaylistIds: song.playlistIds,
              onToggle: (playlistId: number, checked: boolean) =>
                handleTogglePlaylist(playlistId, checked, song.id),
            },
            {
              label: 'Modifier la musique',
              onClick: () => {
                navigate(`/edit-music/${song.id}`);
              },
            },
            {
              label: 'Supprimer',
              onClick: async () => {
                const confirm = window.confirm('Voulez-vous vraiment supprimer cette musique ?');
                if (!confirm) return;
                try {
                  await deleteMusic(song.id);
                  setMusics((prev) => prev.filter((m) => m.id !== song.id));
                } catch (err) {
                  alert('Erreur lors de la suppression');
                }
              },
            },
            { 
              label: 'Ajouter à la file d’attente', 
              onClick: () => addToQueue(song)
            },
          ]}
        />

        <h2 style={{ marginTop: '40px' }}>Mes Albums</h2>
        <div className="album-row">
          {albums.map((album: any) => (
            <PlaylistCard key={album.id} title={album.title} image={album.image} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyMusicPage;
