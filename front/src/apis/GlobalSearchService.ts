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
  id: string;
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
  users?: {
    data: User[];
  };
  playlists?: {
    data: Playlist[];
  };
  musics?: {
    data: Music[];
  };
  albums?: {
    data: Album[];
  };
}

export const search = async (
  query: string,
  categories: ('user' | 'playlist' | 'music' | 'album')[],
  usersPage = 1,
  playlistsPage = 1,
  musicsPage = 1,
  albumsPage = 1,
  perPage = 10
): Promise<SearchResults> => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { 
        query,
        categories: categories.join(','),
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

    return response.data;
  } catch (error) {
    console.error('Error while searching:', error);
    throw error;
  }
};
