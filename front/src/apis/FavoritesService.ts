import axios from './api';
import { API_URL } from './api';

export interface FavoriteSong {
  id: number;
  title: string;
  artist_name: string;
  duration?: string;
  image?: string | null;
  audio: string;
  playlist_ids?: number[];
  date_added?: string;
}

export const getFavorites = async (): Promise<FavoriteSong[]> => {
  const token = localStorage.getItem('authToken');
  const { data } = await axios.get(`${API_URL}/favorites`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data.songs ?? [];
};

export const addFavorite = async (songId: number) => {
  const token = localStorage.getItem('authToken');
  await axios.post(`${API_URL}/favorites/${songId}`, null, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const removeFavorite = async (songId: number) => {
  const token = localStorage.getItem('authToken');
  await axios.delete(`${API_URL}/favorites/${songId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};
