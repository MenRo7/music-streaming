import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  fetchUser,
  fetchUserSummary,
  isSubscribedToUser,
  subscribeToUser,
  unsubscribeFromUser,
} from '../apis/UserService';

import { getUserMusics, getUserAlbums, deleteMusic } from '../apis/MyMusicService';
import { getPlaylists, addMusicToPlaylist, removeMusicFromPlaylist } from '../apis/PlaylistService';
import { addFavorite, removeFavorite, getFavorites } from '../apis/FavoritesService';
import { usePlayer } from '../apis/PlayerContext';
import { useDialogContext } from '../contexts/DialogContext';

import EditProfileModal from '../components/EditProfileModal';
import DropdownMenu from '../components/DropdownMenu';
import PlaylistCard from '../components/PlaylistCard';
import SongList, { UISong } from '../components/SongList';
import DonateModal from '../components/DonateModal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

import '../styles/ProfilePage.css';

const extractPlaylistIds = (val: any): number[] => {
  if (!Array.isArray(val)) return [];
  return val
    .map((x) => (x && typeof x === 'object' ? x.id : x))
    .map(Number)
    .filter(Number.isFinite);
};

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToQueue } = usePlayer();
  const { showToast } = useDialogContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedUserId = searchParams.get('user');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewer, setViewer] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const [songs, setSongs] = useState<UISong[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [subPending, setSubPending] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [donateOpen, setDonateOpen] = useState(false);

  const donParam = searchParams.get('don');
  const [showDonBanner, setShowDonBanner] = useState<boolean>(!!donParam);

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
            album: m.album ?? t('album.unknown'),
            album_image: m.album_image || '',
            audio: m.audio || '',
            dateAdded: m.date_added || '',
            duration: m.duration ?? undefined,
            playlistIds: extractPlaylistIds(m.playlist_ids || []),
            ...(m.album_id != null ? { album_id: Number(m.album_id) } : {}),
            artist_user_id: Number(v?.id),
          } as any)
        );

        setSongs(formattedSongs);
        setAlbums(myAlbums || []);
        setPlaylists(myPlaylists || []);
        setSubscribed(false);
      } else {
        const summaryRes = await fetchUserSummary(targetId!);
        const summary = summaryRes.data;

        setUser(summary.user);

        const formattedSongs: UISong[] = (summary.musics as any[]).map((m: any) =>
          ({
            id: Number(m.id),
            name: m.name,
            artist: m.artist,
            album: m.album ?? t('album.unknown'),
            album_image: m.album_image || '',
            audio: m.audio || '',
            dateAdded: m.date_added || '',
            duration: m.duration ?? undefined,
            playlistIds: extractPlaylistIds(m.playlist_ids || []),
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
          const isSub = await isSubscribedToUser(Number(summary.user.id));
          setSubscribed(isSub);
        } catch {
          setSubscribed(false);
        }
      }
    } catch (e) {
      console.error(t('profilePage.errorLoadingProfile'), e);
    } finally {
      setLoading(false);
    }
  }, [requestedUserId, t]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    (async () => {
      try {
        const favs = await getFavorites();
        const ids = new Set<number>(
          (Array.isArray(favs) ? favs : [])
            .map((m: any) => Number(m.id))
            .filter(Number.isFinite)
        );
        setFavoriteIds(ids);
      } catch (e) {
        console.error(t('profilePage.errorLoadingFavorites'), e);
      }
    })();
  }, [t]);

  const isSelf = useMemo(
    () => Boolean(viewer?.id) && Boolean(user?.id) && Number(viewer.id) === Number(user.id),
    [viewer, user]
  );

  const viewerIsMinor = useMemo(() => {
    const a = Number(viewer?.age ?? 0);
    return Number.isFinite(a) && a < 18;
  }, [viewer]);

  const creatorIsMinor = useMemo(() => {
    const a = Number(user?.age ?? 0);
    return Number.isFinite(a) && a < 18;
  }, [user]);

  const donateDisabled = useMemo(() => {
    if (viewerIsMinor) return true;
    if (!user?.payments_enabled) return true;
    if (creatorIsMinor) return true;
    return false;
  }, [viewerIsMinor, user?.payments_enabled, creatorIsMinor]);

  const donateTitle = useMemo(() => {
    if (viewerIsMinor) return t('profilePage.donateMinorViewer');
    if (creatorIsMinor) return t('profilePage.donateMinorCreator');
    if (!user?.payments_enabled) return t('profilePage.donateNotEnabled');
    return t('profilePage.donateButton');
  }, [viewerIsMinor, creatorIsMinor, user?.payments_enabled, t]);

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
      console.error(t('profilePage.errorUpdatingPlaylist'), e);
      showToast(t('profilePage.errorPlaylistUpdate'), 'error');
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
      window.dispatchEvent(new Event('subscriptions:changed'));
    } catch (e) {
      console.error(t('profilePage.errorSubscription'), e);
    } finally {
      setSubPending(false);
    }
  };

  const addToFavoritesLocal = async (id: number) => {
    await addFavorite(id);
    setFavoriteIds((prev) => new Set(prev).add(Number(id)));
  };
  const removeFromFavoritesLocal = async (id: number) => {
    await removeFavorite(id);
    setFavoriteIds((prev) => {
      const s = new Set(prev);
      s.delete(Number(id));
      return s;
    });
  };
  const isFavorite = (id: number) => favoriteIds.has(Number(id));

  const songActions = useCallback(
    (song: UISong) => {
      const s: any = song;
      const viewItems = s?.album_id
        ? [{ label: t('mediaPage.viewAlbum'), onClick: () => navigate(`/album/${s.album_id}`) }]
        : [];

      const base = [
        ...viewItems,
        {
          label: isFavorite(song.id) ? t('mediaPage.removeFromFavorites') : t('mediaPage.addToFavorites'),
          onClick: async () => {
            try {
              if (isFavorite(song.id)) await removeFromFavoritesLocal(song.id);
              else await addToFavoritesLocal(song.id);
            } catch (e) {
              console.error(t('profilePage.errorUpdatingFavorites'), e);
            }
          },
        },
        {
          label: t('music.addToPlaylist'),
          onClick: () => {},
          withPlaylistMenu: true,
          songId: song.id,
          existingPlaylistIds: song.playlistIds ?? [],
          onToggle: (playlistId: number, checked: boolean) =>
            handleTogglePlaylist(playlistId, checked, song.id),
        },
        { label: t('mediaPage.addToQueue'), onClick: () => addToQueue(song) },
      ];

      if (isSelf) {
        base.push(
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
                showToast(t('profilePage.successDeletingMusic'), 'success');
              } catch {
                showToast(t('profilePage.errorDeletingMusic'), 'error');
              }
            },
          }
        );
      }

      return base;
    },
    [addToQueue, navigate, isSelf, favoriteIds, t]
  );

  const hasAvatar = Boolean(user?.profile_image);

  const totalStats = useMemo(() => {
    return {
      musics: songs.length,
      albums: albums.length,
      playlists: playlists.length,
    };
  }, [songs.length, albums.length, playlists.length]);

  const closeDonBanner = () => {
    setShowDonBanner(false);
    if (searchParams.has('don')) {
      searchParams.delete('don');
      setSearchParams(searchParams, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-content">
          <div style={{ padding: 24 }}>{t('profilePage.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-content">
        {showDonBanner && (
          <div
            className={`don-banner ${donParam === 'ok' ? 'success' : 'error'}`}
            role="status"
          >
            <span>
              {donParam === 'ok'
                ? t('profilePage.donateSuccess')
                : t('profilePage.donateCancelled')}
            </span>
            <button className="don-banner-close" onClick={closeDonBanner} aria-label={t('profilePage.closeBanner')}>
              ×
            </button>
          </div>
        )}

        <div className="profile-header">
          <img
            className="profile-image"
            src={hasAvatar ? user.profile_image : '/placeholder-avatar.png'}
            alt="User Profile"
          />

          <div className="profile-info" style={{ flex: 1 }}>
            <h1>{user?.name ?? t('profilePage.profile')}</h1>
            {isSelf && <p>{user?.email}</p>}
          </div>

          {!isSelf && (
            <div className="actions-right">
              <button
                className={`subscribe-btn ${subscribed ? 'is-subscribed' : ''}`}
                onClick={onToggleSubscribe}
                disabled={subPending}
                title={subscribed ? t('profilePage.unsubscribeTitle') : t('profilePage.subscribeTitle')}
              >
                {subscribed ? t('profilePage.subscribed') : t('profilePage.subscribePlus')}
              </button>

              <div className="donate-section">
                <button
                  className="donate-btn"
                  onClick={() => {
                    if (viewer?.age && viewer.age < 18) return;
                    if (!user?.payments_enabled || (user?.age && user.age < 18)) return;
                    setDonateOpen(true);
                  }}
                  disabled={
                    (viewer?.age && viewer.age < 18) ||
                    !user?.payments_enabled ||
                    (user?.age && user.age < 18)
                  }
                >
                  {t('profilePage.donateButton')}
                </button>

                {viewer?.age && viewer.age < 18 && (
                  <p className="donate-hint">
                    <em>{t('profilePage.donateMinorViewerHint')}</em>
                  </p>
                )}
                {user?.age && user.age < 18 && (
                  <p className="donate-hint">
                    <em>{t('profilePage.donateMinorCreatorHint')}</em>
                  </p>
                )}
                {!user?.payments_enabled && !(user?.age && user.age < 18) && (
                  <p className="donate-hint">
                    <em>{t('profilePage.donateNotEnabledHint')}</em>
                  </p>
                )}
              </div>
            </div>
          )}

          {isSelf && (
            <DropdownMenu
              trigger={<FontAwesomeIcon icon={faEllipsisH} className="profile-menu-icon" />}
              items={[{ label: t('profilePage.editProfile'), onClick: () => setIsModalOpen(true) }]}
            />
          )}
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h2>{t('profilePage.musics')}</h2>
            <p>{totalStats.musics}</p>
          </div>
          <div className="stat-card">
            <h2>{t('profilePage.albums')}</h2>
            <p>{totalStats.albums}</p>
          </div>
          <div className="stat-card">
            <h2>{t('profilePage.playlists')}</h2>
            <p>{totalStats.playlists}</p>
          </div>
        </div>

        <div className="top-section" style={{ textAlign: 'left' }}>
          <h2 style={{ textAlign: 'left', marginBottom: 16 }}>
            {isSelf ? t('profilePage.myMusics') : t('profilePage.musics')}
          </h2>
          <SongList
            songs={songs}
            showAlbum
            showArtist
            showDateAdded
            showDuration={true}
            getActions={songActions as any}
            onAlbumClick={(song) => {
              const s: any = song;
              if (s.album_id) navigate(`/album/${s.album_id}`);
            }}
          />
        </div>

        <div className="top-section" style={{ textAlign: 'left' }}>
          <h2 style={{ textAlign: 'left', marginBottom: 16 }}>
            {isSelf ? t('profilePage.myAlbums') : t('profilePage.albums')}
          </h2>
          <div className="album-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {albums.length === 0 && <div>{t('profilePage.noAlbums')}</div>}
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

        <div className="top-section" style={{ textAlign: 'left' }}>
          <h2 style={{ textAlign: 'left', marginBottom: 16 }}>
            {isSelf ? t('profilePage.myPlaylists') : t('profilePage.playlists')}
          </h2>
        <div className="album-row" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {playlists.length === 0 && <div>{t('profilePage.noPlaylists')}</div>}
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
            onClose={() => setIsModalOpen(false)}
            user={user}
            onProfileUpdate={(u) => setUser(u)}
          />
        )}

        {!isSelf && (
          <DonateModal
            isOpen={donateOpen}
            onClose={() => setDonateOpen(false)}
            toUserId={Number(user?.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
