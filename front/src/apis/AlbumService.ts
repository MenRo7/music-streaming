import axios from './api';
import { API_URL } from './api';

export interface AlbumMusic {
  id: number;
  title: string;
  artist_name?: string;
  artist_user_id?: number | null;
  album_id?: number | null;
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

const cleanToken = (t: string | null) => (t || '').replace(/^"+|"+$/g, '').trim();

const getAuthHeaders = () => {
  const token = cleanToken(localStorage.getItem('authToken'));
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const getAlbumById = async (id: number | string) => {
  const res = await axios.get(`${API_URL}/album/${id}`, { headers: getAuthHeaders() });
  return res.data as Album;
};

export const createAlbum = async (formData: FormData) => {
  const response = await window.fetch(`${API_URL}/album`, {
    method: 'POST',
    headers: getAuthHeaders() as any,
    body: formData,
  });
  if (!response.ok) throw new Error('Erreur création album');
  return response.json();
};

export const updateAlbum = async (id: number, formData: FormData) => {
  formData.append('_method', 'PUT');
  const res = await window.fetch(`${API_URL}/album/${id}`, {
    method: 'POST',
    headers: getAuthHeaders() as any,
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur mise à jour album');
  const data = await res.json();
  window.dispatchEvent(new Event('library:changed'));
  return data;
};

export const deleteAlbum = async (id: number) => {
  const res = await window.fetch(`${API_URL}/album/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders() as any,
  });
  if (!res.ok) throw new Error('Erreur suppression album');
  const data = await res.json();

  const ids: number[] = Array.isArray(data?.deleted_track_ids) ? data.deleted_track_ids : [];
  if (ids.length > 0) {
    window.dispatchEvent(new CustomEvent('library:pruned', { detail: { trackIds: ids } }));
  }
  window.dispatchEvent(new Event('library:changed'));
  return data;
};

export const addTrackToAlbum = async (albumId: number, formData: FormData) => {
  formData.append('album_id', String(albumId));
  const res = await window.fetch(`${API_URL}/music`, {
    method: 'POST',
    headers: getAuthHeaders() as any,
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur ajout titre');
  const data = await res.json();
  window.dispatchEvent(new Event('library:changed'));
  return data;
};

export const updateTrack = async (trackId: number, formData: FormData) => {
  formData.append('_method', 'PUT');
  const res = await window.fetch(`${API_URL}/music/${trackId}`, {
    method: 'POST',
    headers: getAuthHeaders() as any,
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur mise à jour titre');
  const data = await res.json();
  window.dispatchEvent(new Event('library:changed'));
  return data;
};

export const deleteTrack = async (trackId: number) => {
  const res = await window.fetch(`${API_URL}/music/${trackId}`, {
    method: 'DELETE',
    headers: getAuthHeaders() as any,
  });
  if (!res.ok) throw new Error('Erreur suppression titre');
  const data = await res.json();

  const ids: number[] = Array.isArray(data?.deleted_track_ids) && data.deleted_track_ids.length
    ? data.deleted_track_ids.map((n: any) => Number(n)).filter(Number.isFinite)
    : [Number(trackId)];

  if (ids.length > 0) {
    window.dispatchEvent(new CustomEvent('tracks:deleted', { detail: { ids } }));
    window.dispatchEvent(new CustomEvent('library:pruned', { detail: { trackIds: ids } }));
  }
  window.dispatchEvent(new Event('library:changed'));
  return data;
};

export const likeAlbum = async (albumId: number) => {
  const res = await axios.post(`${API_URL}/album/${albumId}/like`, {}, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};

export const unlikeAlbum = async (albumId: number) => {
  const res = await axios.delete(`${API_URL}/album/${albumId}/like`, { headers: getAuthHeaders() });
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};
