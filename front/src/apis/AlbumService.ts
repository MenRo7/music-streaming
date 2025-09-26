import axios from './api';
import { API_URL } from './api';

export interface AlbumMusic {
  id: number;
  title: string;
  artist_name?: string;
  duration?: number;
  audio?: string;
  playlist_ids?: number[];
}

export interface Album {
  id: number;
  title: string;
  image?: string | null;
  artist_name?: string | null;
  type?: string | null;
  created_at?: string | null;
  musics?: AlbumMusic[];
}

export const getAlbumById = async (id: number | string) => {
  const token = localStorage.getItem('authToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_URL}/album/${id}`, { headers });
  return res.data;
};

export const createAlbum = async (formData: FormData) => {
  const token = localStorage.getItem('authToken');
  const response = await window.fetch(`${API_URL}/album`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token || ''}` },
    body: formData
  });
  if (!response.ok) throw new Error('Erreur création album');
  return response.json();
};
