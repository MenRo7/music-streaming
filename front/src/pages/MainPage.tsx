import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getPlaylists } from '../apis/PlaylistService';
import { getLikesSummary } from '../apis/UserService';
import { getFavorites } from '../apis/FavoritesService';
import { getUserAlbums } from '../apis/MyMusicService';

import PlaylistCard from '../components/PlaylistCard';
import ProfileCircleCard from '../components/ProfileCircleCard';
import { usePlayer } from '../apis/PlayerContext';

import '../styles/MainPage.css';

const TrackCard: React.FC<{
  id: number;
  title: string;
  artist: string;
  image?: string | null;
  audio?: string;
  onPlay?: () => void;
  onOpenAlbum?: () => void;
}> = ({ title, artist, image, onPlay, onOpenAlbum }) => (
  <div className="mp-track-card" role={onPlay ? 'button' : undefined}>
    <div className="mp-track-cover" onClick={onOpenAlbum}>
      {image ? <img src={image} alt={title} /> : <div className="mp-cover-ph" />}
    </div>
    <div className="mp-track-infos">
      <div className="mp-track-title" title={title}>
        {title}
      </div>
      <div className="mp-track-artist" title={artist}>
        {artist}
      </div>
    </div>
    <button className="mp-play-btn" onClick={onPlay} aria-label={`Lire ${title}`}>
      ▶
    </button>
  </div>
);

interface LikedProfile {
  id: number;
  name: string;
  image?: string | null;
}
interface LikedAlbum {
  id: number;
  title: string;
  image?: string | null;
}
interface LikedPlaylist {
  id: number;
  title: string;
  image?: string | null;
}
interface FavoriteItem {
  id: number;
  name: string;
  artist: string;
  album?: string;
  album_image?: string | null;
  audio?: string;
  dateAdded?: string;
}

const MainPage: React.FC = () => {
  const navigate = useNavigate();
  const { playSong } = usePlayer();

  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState<LikedPlaylist[]>([]);
  const [following, setFollowing] = useState<LikedProfile[]>([]);
  const [likedAlbums, setLikedAlbums] = useState<LikedAlbum[]>([]);
  const [recentFavorites, setRecentFavorites] = useState<FavoriteItem[]>([]);
  const [myAlbums, setMyAlbums] = useState<LikedAlbum[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pls, likes, favs, albums] = await Promise.all([
        getPlaylists(),
        getLikesSummary(),
        getFavorites(),
        getUserAlbums(),
      ]);

      setPlaylists(pls ?? []);
      setFollowing(likes?.profiles ?? []);
      setLikedAlbums(likes?.albums ?? []);
      setRecentFavorites(Array.isArray(favs) ? favs.slice(0, 12) : []);
      setMyAlbums(Array.isArray(albums) ? albums.slice(0, 12) : []);
    } catch (e) {
      console.error('Chargement MainPage échoué', e);
      setPlaylists([]);
      setFollowing([]);
      setLikedAlbums([]);
      setRecentFavorites([]);
      setMyAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hasAny = useMemo(
    () =>
      (playlists?.length ?? 0) +
        (following?.length ?? 0) +
        (recentFavorites?.length ?? 0) +
        (myAlbums?.length ?? 0) >
      0,
    [playlists, following, recentFavorites, myAlbums]
  );

  if (loading) {
    return (
      <main id="main-content" className="main-content">
        <div className="main-page">
          <div className="mp-loading">Chargement…</div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="main-content">
      <div className="main-page">
        <h1>Page principale</h1>

        {!hasAny && (
          <div className="mp-empty">
            Rien à afficher pour l’instant. Ajoute des favoris, des playlists et des albums ✨
          </div>
        )}

        {playlists.length > 0 && (
          <div className="top-section">
            <h2>Vos playlists</h2>
            <div className="album-row">
              {playlists.slice(0, 12).map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  title={pl.title}
                  image={pl.image}
                  onClick={() => navigate(`/playlist/${pl.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {following.length > 0 && (
          <div className="top-section">
            <h2>Vos artistes suivis</h2>
            <div className="album-row">
              {following.slice(0, 16).map((p) => (
                <ProfileCircleCard
                  key={p.id}
                  name={p.name}
                  image={p.image || undefined}
                  onClick={() => navigate(`/profile?user=${p.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {recentFavorites.length > 0 && (
          <div className="top-section">
            <h2>Récemment écoutés</h2>
            <div className="album-row">
              {recentFavorites.map((m) => (
                <TrackCard
                  key={m.id}
                  id={m.id}
                  title={m.name}
                  artist={m.artist}
                  image={m.album_image || undefined}
                  onPlay={() =>
                    playSong(m.audio || '', m.name, m.artist, m.album_image || '', m.id)
                  }
                  onOpenAlbum={() =>
                    navigate(`/search?query=${encodeURIComponent(m.name)}`)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {myAlbums.length > 0 && (
          <div className="top-section">
            <h2>Nouveautés</h2>
            <div className="album-row">
              {myAlbums.map((a) => (
                <PlaylistCard
                  key={a.id}
                  title={a.title}
                  image={a.image}
                  onClick={() => navigate(`/album/${a.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {likedAlbums.length > 0 && (
          <div className="top-section">
            <h2>Albums que vous aimez</h2>
            <div className="album-row">
              {likedAlbums.slice(0, 12).map((a) => (
                <PlaylistCard
                  key={a.id}
                  title={a.title}
                  image={a.image}
                  onClick={() => navigate(`/album/${a.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainPage;
