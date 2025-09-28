import axios from './api';
import { API_URL } from './api';

export interface AlbumMusic {
  id: number;
  title: string;
  artist_name?: string;
  duration?: number | string;
  audio?: string;
  image?: string | null;
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
  user_id?: number;
  is_liked?: boolean;
}

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAlbumById = async (id: number | string) => {
  const res = await axios.get(`${API_URL}/album/${id}`, { headers: authHeaders() });
  return res.data as Album;
};

export const createAlbum = async (formData: FormData) => {
  const response = await window.fetch(`${API_URL}/album`, {
    method: 'POST',
    headers: authHeaders() as any,
    body: formData,
  });
  if (!response.ok) throw new Error('Erreur création album');
  return response.json();
};

export const updateAlbum = async (id: number, formData: FormData) => {
  formData.append('_method', 'PUT');
  const res = await window.fetch(`${API_URL}/album/${id}`, {
    method: 'POST',
    headers: authHeaders() as any,
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur mise à jour album');
  return res.json();
};

export const deleteAlbum = async (id: number) => {
  const res = await window.fetch(`${API_URL}/album/${id}`, {
    method: 'DELETE',
    headers: authHeaders() as any,
  });
  if (!res.ok) throw new Error('Erreur suppression album');
  return res.json();
};

export const addTrackToAlbum = async (albumId: number, formData: FormData) => {
  formData.append('album_id', String(albumId));
  const res = await window.fetch(`${API_URL}/music`, {
    method: 'POST',
    headers: authHeaders() as any,
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur ajout titre');
  return res.json();
};

export const updateTrack = async (trackId: number, formData: FormData) => {
  formData.append('_method', 'PUT');
  const res = await window.fetch(`${API_URL}/music/${trackId}`, {
    method: 'POST',
    headers: authHeaders() as any,
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur mise à jour titre');
  return res.json();
};

export const deleteTrack = async (trackId: number) => {
  const res = await window.fetch(`${API_URL}/music/${trackId}`, {
    method: 'DELETE',
    headers: authHeaders() as any,
  });
  if (!res.ok) throw new Error('Erreur suppression titre');
  return res.json();
};

export const likeAlbum = async (albumId: number) => {
  const res = await axios.post(`${API_URL}/album/${albumId}/like`, {}, { headers: authHeaders() });
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};

export const unlikeAlbum = async (albumId: number) => {
  const res = await axios.delete(`${API_URL}/album/${albumId}/like`, { headers: authHeaders() });
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};
