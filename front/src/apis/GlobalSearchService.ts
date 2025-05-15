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
  name: string;
  artist_name: string;
  image: string | null;
  audio: string;
}

export interface SearchResults {
  users?: {
    data: User[];
  };
  playlists?: {
    data: Playlist[];
  };
  musics?: Music[];
}

export const search = async (
  query: string,
  categories: ('user' | 'playlist' | 'music')[],
  usersPage = 1,
  playlistsPage = 1,
  musicsPage = 1,
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


