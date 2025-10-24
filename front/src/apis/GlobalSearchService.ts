import axios from 'axios';
import { API_URL } from '../apis/api';

export interface User {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface Playlist {
  id: number;
  title: string;
  image: string | null;
}

export interface Music {
  id: number;
  title: string;
  artist_name: string;
  audio: string;
  image: string | null;
}

export interface Album {
  id: number;
  title: string;
  image: string | null;
}

export interface SearchResults {
  users?: { data: User[] };
  playlists?: { data: Playlist[] };
  musics?: { data: Music[] };
  albums?: { data: Album[] };
}

type Category = 'user' | 'playlist' | 'music' | 'album';

const toNum = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalize = (raw: any, requested: Category[]): SearchResults => {
  const want = (c: Category) => requested.length === 0 || requested.includes(c);

  const users: User[] = want('user')
    ? (raw?.users?.data ?? []).map((u: any) => ({
        id: toNum(u.id),
        name: u.name,
        profile_image: u.profile_image ?? null,
      }))
    : [];

  const playlists: Playlist[] = want('playlist')
    ? (raw?.playlists?.data ?? []).map((p: any) => ({
        id: toNum(p.id),
        title: p.title,
        image: p.image ?? null,
      }))
    : [];

  const musics: Music[] = want('music')
    ? (raw?.musics?.data ?? []).map((m: any) => ({
        id: toNum(m.id),
        title: m.title,
        artist_name: m.artist_name,
        audio: m.audio,
        image: m.image ?? null,
      }))
    : [];

  const albums: Album[] = want('album')
    ? (raw?.albums?.data ?? []).map((a: any) => ({
        id: toNum(a.id),
        title: a.title,
        image: a.image ?? null,
      }))
    : [];

  const out: SearchResults = {};
  if (want('user')) out.users = { data: users };
  if (want('playlist')) out.playlists = { data: playlists };
  if (want('music')) out.musics = { data: musics };
  if (want('album')) out.albums = { data: albums };
  return out;
};

export const search = async (
  query: string,
  categories: Category[],
  usersPage = 1,
  playlistsPage = 1,
  musicsPage = 1,
  albumsPage = 1,
  perPage = 10
): Promise<SearchResults> => {
  try {
    // Normalize categories to array
    const categoriesArray = Array.isArray(categories) ? categories : [categories as Category];

    const response = await axios.get(`${API_URL}/search`, {
      params: {
        query,
        categories: categoriesArray.join(','),
        users_page: usersPage,
        playlists_page: playlistsPage,
        musics_page: musicsPage,
        albums_page: albumsPage,
        per_page: perPage,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    return normalize(response.data, categoriesArray);
  } catch (error) {
    console.error('Error while searching:', error);
    throw error;
  }
};
