import axios from 'axios';
import { API_URL } from './api';

const cleanToken = (t: string | null) => (t || '').replace(/^"+|"+$/g, '').trim();

const getAuthHeaders = () => {
  const token = cleanToken(localStorage.getItem('authToken'));
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  };
};

export const getPlaylistById = async (id: number) => {
  const response = await axios.get(`${API_URL}/playlists/${id}`, getAuthHeaders());
  return response.data;
};

export const getPlaylists = async () => {
  if (getAuthHeaders()) return [];
  const { data } = await axios.get(`${API_URL}/playlists`, getAuthHeaders());
  return data;
};

export const createPlaylist = async (playlist: FormData) => {
  const response = await axios.post(`${API_URL}/playlists`, playlist, {
    ...getAuthHeaders(),
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updatePlaylist = async (id: number, playlist: FormData) => {
  playlist.append('_method', 'PUT');
  const response = await axios.post(`${API_URL}/playlists/${id}`, playlist, {
    ...getAuthHeaders(),
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deletePlaylist = async (id: number) => {
  const response = await axios.delete(`${API_URL}/playlists/${id}`, getAuthHeaders());
  return response.data;
};

export const addMusicToPlaylist = async (playlistId: number, musicId: number) => {
  const response = await axios.post(
    `${API_URL}/playlists/${playlistId}/add-music`,
    { music_id: musicId },
    getAuthHeaders()
  );
  return response.data;
};

export const removeMusicFromPlaylist = async (playlistId: number, musicId: number) => {
  const response = await axios.post(
    `${API_URL}/playlists/${playlistId}/remove-music`,
    { music_id: musicId },
    getAuthHeaders()
  );
  return response.data;
};

export const likePlaylist = async (playlistId: number) => {
  const res = await axios.post(`${API_URL}/playlists/${playlistId}/like`, {}, getAuthHeaders());
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};

export const unlikePlaylist = async (playlistId: number) => {
  const res = await axios.delete(`${API_URL}/playlists/${playlistId}/like`, getAuthHeaders());
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};
