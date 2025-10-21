import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getUserMusics, getUserAlbums, deleteMusic } from '../apis/MyMusicService';
import { addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import { addFavorite } from '../apis/FavoritesService';
import { usePlayer } from '../contexts/PlayerContext';
import { useDialogContext } from '../contexts/DialogContext';

import PlaylistCard from '../components/PlaylistCard';
import SongList, { UISong } from '../components/SongList';

const extractPlaylistIds = (val: any): number[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((x) => (x && typeof x === 'object' ? x.id : x))
    .map(Number)
    .filter(Number.isFinite);
};

const MyMusicPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToQueue } = usePlayer();
  const { showToast } = useDialogContext();

  const [songs, setSongs] = useState<UISong[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [musicData, albumData] = await Promise.all([getUserMusics(), getUserAlbums()]);

        const formatted: UISong[] = (musicData as any[]).map((m: any) => ({
          id: Number(m.id),
          name: m.name,
          artist: m.artist,
          album: m.album ?? t('album.unknown'),
          album_image: m.album_image || '',
          audio: m.audio || '',
          dateAdded: m.date_added ? new Date(m.date_added).toLocaleDateString() : '',
          duration: m.duration ?? undefined,
          playlistIds: extractPlaylistIds(m.playlist_ids || []),
          ...(m.album_id != null ? { album_id: Number(m.album_id) } : {}),
          ...(m.artist_user_id != null ? { artist_user_id: Number(m.artist_user_id) } : {}),
        }));

        setSongs(formatted);
        setAlbums(albumData);
      } catch (error) {
        console.error(t('myMusic.errorLoading'), error);
      }
    };

    fetchData();
  }, [t]);

  const onTogglePlaylist = async (
    playlistId: number | string,
    checked: boolean,
    songId: number | string
  ) => {
    const pid = Number(playlistId);
    const sid = Number(songId);
    if (!Number.isFinite(pid) || !Number.isFinite(sid)) return;

    try {
      if (checked) await addMusicToPlaylist(pid, sid);
      else await removeMusicFromPlaylist(pid, sid);
    } catch {
      showToast(t('myMusic.errorUpdatingPlaylist'), 'error');
    }
  };

  return (
    <div className="media-content">
      <div className="media-page">
        <h2>{t('myMusic.title')}</h2>

        <SongList
          songs={songs}
          showAlbum
          showArtist
          showDateAdded
          showDuration={true}
          getActions={(song) => {
            const s: any = song;
            const viewItems = [
              ...(s.album_id ? [{ label: t('mediaPage.viewAlbum'), onClick: () => navigate(`/album/${s.album_id}`) }] : []),
              ...(s.artist_user_id ? [{ label: t('mediaPage.viewArtist'), onClick: () => navigate(`/profile?user=${s.artist_user_id}`) }] : []),
            ];

            return [
              ...viewItems,
              {
                label: t('mediaPage.addToFavorites'),
                onClick: () => {
                  addFavorite(song.id).catch((e) => console.error(t('album.errorAddingFavorites'), e));
                },
              },
              {
                label: t('music.addToPlaylist'),
                onClick: () => {},
                withPlaylistMenu: true,
                songId: song.id,
                existingPlaylistIds: song.playlistIds ?? [],
                onToggle: (playlistId: number, checked: boolean) =>
                  onTogglePlaylist(playlistId, checked, song.id),
              },
              { label: t('mediaPage.addToQueue'), onClick: () => addToQueue(song) },
              {
                label: t('mediaPage.modifyMusic'),
                onClick: () => navigate(`/edit-music/${song.id}`),
              },
              {
                label: t('common.delete'),
                onClick: async () => {
                  try {
                    await deleteMusic(song.id);
                    setSongs((prev) => prev.filter((m) => m.id !== song.id));
                    showToast(t('myMusic.successDeletingMusic'), 'success');
                  } catch {
                    showToast(t('myMusic.errorDeletingMusic'), 'error');
                  }
                },
              },
            ];
          }}
        />

        <h2 style={{ marginTop: '40px' }}>{t('myMusic.myAlbums')}</h2>
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
