import axios from 'axios';
import { API_URL } from '../apis/api';

export interface User {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface Playlist {
  id: number;
  name: string;
  category?: string;
}

export interface SearchResults {
  users?: {
    data: User[];
  };
  playlists?: {
    data: Playlist[];
  };
}

export const search = async (
  query: string,
  category: 'all' | 'user' | 'playlist' = 'all'
): Promise<SearchResults> => {
  if (!['all', 'user', 'playlist'].includes(category)) {
    throw new Error('Invalid category. Valid categories are: "all", "user", "playlist".');
  }

  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query, category },
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
