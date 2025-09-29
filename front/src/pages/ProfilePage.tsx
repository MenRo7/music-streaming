import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  fetchUser,
  fetchUserSummary,
  isSubscribedToUser,
  subscribeToUser,
  unsubscribeFromUser,
} from "../apis/UserService";

import { getUserMusics, getUserAlbums, deleteMusic } from "../apis/MyMusicService";
import { getPlaylists, addMusicToPlaylist, removeMusicFromPlaylist } from "../apis/PlaylistService";
import { addFavorite } from "../apis/FavoritesService";
import { usePlayer } from "../apis/PlayerContext";

import EditProfileModal from "../components/EditProfileModal";
import DropdownMenu from "../components/DropdownMenu";
import PlaylistCard from "../components/PlaylistCard";
import SongList, { UISong } from "../components/SongList";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";

import "../styles/ProfilePage.css";

const toNumberArray = (arr: any[]): number[] =>
  (Array.isArray(arr) ? arr : []).map(Number).filter(Number.isFinite);

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToQueue } = usePlayer();

  const [searchParams] = useSearchParams();
  const requestedUserId = searchParams.get("user");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewer, setViewer] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const [songs, setSongs] = useState<UISong[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // abonnement
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [subPending, setSubPending] = useState<boolean>(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const viewerRes = await fetchUser();
      const v = viewerRes.data;
      setViewer(v);

      const targetId = requestedUserId ? Number(requestedUserId) : null;
      const isSelf = !targetId || Number.isNaN(targetId) || Number(v?.id) === targetId;

      if (isSelf) {
        const [mySongs, myAlbums, myPlaylists] = await Promise.all([
          getUserMusics(),
          getUserAlbums(),
          getPlaylists(),
        ]);

        setUser(v);

        const formattedSongs: UISong[] = (mySongs as any[]).map((m: any) =>
          ({
            id: Number(m.id),
            name: m.name,
            artist: m.artist,
            album: m.album ?? "Inconnu",
            album_image: m.album_image || "",
            audio: m.audio || "",
            dateAdded: m.date_added || "",
            duration: m.duration ?? undefined,
            playlistIds: toNumberArray(m.playlist_ids || []),
            ...(m.album_id != null ? { album_id: Number(m.album_id) } : {}),
            artist_user_id: Number(v?.id),
          } as any)
        );

        setSongs(formattedSongs);
        setAlbums(myAlbums || []);
        setPlaylists(myPlaylists || []);
        setSubscribed(false)
      } else {
        const summaryRes = await fetchUserSummary(targetId!);
        const summary = summaryRes.data;

        setUser(summary.user);

        const formattedSongs: UISong[] = (summary.musics as any[]).map((m: any) =>
          ({
            id: Number(m.id),
            name: m.name,
            artist: m.artist,
            album: m.album ?? "Inconnu",
            album_image: m.album_image || "",
            audio: m.audio || "",
            dateAdded: m.date_added || "",
            duration: m.duration ?? undefined,
            playlistIds: toNumberArray(m.playlist_ids || []),
            ...(m.album_id != null ? { album_id: Number(m.album_id) } : {}),
            ...(m.artist_user_id != null
              ? { artist_user_id: Number(m.artist_user_id) }
              : { artist_user_id: Number(summary?.user?.id) }),
          } as any)
        );

        setSongs(formattedSongs);
        setAlbums(summary.albums || []);
        setPlaylists(summary.playlists || []);

        try {
          const isSub = await isSubscribedToUser(Number(summary.user.id));          setSubscribed(isSub);
        } catch {
          setSubscribed(false);
        }
      }
    } catch (e) {
      console.error("Erreur chargement profil:", e);
    } finally {
      setLoading(false);
    }
  }, [requestedUserId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const isSelf = useMemo(
    () => Boolean(viewer?.id) && Boolean(user?.id) && Number(viewer.id) === Number(user.id),
    [viewer, user]
  );

  const openProfileModal = () => setIsModalOpen(true);
  const closeProfileModal = () => setIsModalOpen(false);
  const handleProfileUpdate = (updatedUser: any) => setUser(updatedUser);

  const handleTogglePlaylist = async (
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
    } catch (e) {
      console.error("Maj playlist échouée", e);
      alert("Erreur lors de la modification de la playlist.");
    }
  };

  const onToggleSubscribe = async () => {
    if (!user?.id || isSelf || subPending) return;
    setSubPending(true);
    try {
      if (subscribed) {
        await unsubscribeFromUser(Number(user.id));
        setSubscribed(false);
      } else {
        await subscribeToUser(Number(user.id));
        setSubscribed(true);
      }
      window.dispatchEvent(new Event("subscriptions:changed"));
    } catch (e) {
      console.error("Erreur abonnement/désabonnement:", e);
    } finally {
      setSubPending(false);
    }
  };

  const songActions = useCallback(
    (song: UISong) => {
      const base = [
        {
          label: "Ajouter aux favoris",
          onClick: () =>
            addFavorite(song.id).catch((e) => console.error("Ajout aux favoris échoué", e)),
        },
        {
          label: "Ajouter à une playlist",
          onClick: () => {},
          withPlaylistMenu: true,
          songId: song.id,
          existingPlaylistIds: song.playlistIds ?? [],
          onToggle: (playlistId: number, checked: boolean) =>
            handleTogglePlaylist(playlistId, checked, song.id),
        },
        { label: "Ajouter à la file d’attente", onClick: () => addToQueue(song) },
      ];

      if (isSelf) {
        base.push(
          {
            label: "Modifier la musique",
            onClick: () => navigate(`/edit-music/${song.id}`),
          },
          {
            label: "Supprimer",
            onClick: async () => {
              try {
                await deleteMusic(song.id);
                setSongs((prev) => prev.filter((m) => m.id !== song.id));
              } catch {
                alert("Erreur lors de la suppression");
              }
            },
          }
        );
      }

      return base;
    },
    [addToQueue, navigate, isSelf]
  );

  const hasAvatar = Boolean(user?.profile_image);

  const totalStats = useMemo(() => {
    return {
      musics: songs.length,
      albums: albums.length,
      playlists: playlists.length,
    };
  }, [songs.length, albums.length, playlists.length]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-content">
          <div style={{ padding: 24 }}>Chargement…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-content">
        <div className="profile-header">
          <img
            className="profile-image"
            src={hasAvatar ? user.profile_image : "/placeholder-avatar.png"}
            alt="User Profile"
          />

          <div className="profile-info" style={{ flex: 1 }}>
            <h1>{user?.name ?? "Profil"}</h1>
            {isSelf && <p>{user?.email}</p>}
          </div>

          {!isSelf && (
            <button
              className={`subscribe-btn ${subscribed ? "is-subscribed" : ""}`}
              onClick={onToggleSubscribe}
              disabled={subPending}
              title={subscribed ? "Se désabonner" : "S’abonner"}
            >
              {subscribed ? "Abonné" : "S’abonner +"}
            </button>
          )}

          {isSelf && (
            <DropdownMenu
              trigger={<FontAwesomeIcon icon={faEllipsisH} className="profile-menu-icon" />}
              items={[{ label: "Modifier le profil", onClick: openProfileModal }]}
            />
          )}
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h2>Musiques</h2>
            <p>{totalStats.musics}</p>
          </div>
          <div className="stat-card">
            <h2>Albums</h2>
            <p>{totalStats.albums}</p>
          </div>
          <div className="stat-card">
            <h2>Playlists</h2>
            <p>{totalStats.playlists}</p>
          </div>
        </div>

        <div className="top-section" style={{ textAlign: "left" }}>
          <h2 style={{ textAlign: "left", marginBottom: 16 }}>
            {isSelf ? "Mes musiques" : "Musiques"}
          </h2>
          <SongList
            songs={songs}
            showAlbum
            showArtist
            showDateAdded
            showDuration={false}
            getActions={songActions as any}
            onAlbumClick={(song) => {
              const s: any = song;
              if (s.album_id) navigate(`/album/${s.album_id}`);
            }}
          />
        </div>

        <div className="top-section" style={{ textAlign: "left" }}>
          <h2 style={{ textAlign: "left", marginBottom: 16 }}>
            {isSelf ? "Mes albums" : "Albums"}
          </h2>
          <div className="album-row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {albums.length === 0 && <div>Aucun album pour le moment.</div>}
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

        <div className="top-section" style={{ textAlign: "left" }}>
          <h2 style={{ textAlign: "left", marginBottom: 16 }}>
            {isSelf ? "Mes playlists" : "Playlists"}
          </h2>
          <div className="album-row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {playlists.length === 0 && <div>Aucune playlist pour le moment.</div>}
            {playlists.map((pl: any) => (
              <PlaylistCard
                key={pl.id}
                title={pl.title}
                image={pl.image}
                onClick={() => navigate(`/playlist/${pl.id}`)}
              />
            ))}
          </div>
        </div>

        {isSelf && isModalOpen && (
          <EditProfileModal
            isOpen={isModalOpen}
            onClose={closeProfileModal}
            user={user}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
