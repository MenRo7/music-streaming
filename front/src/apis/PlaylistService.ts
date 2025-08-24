import axios from 'axios';
import { API_URL } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getPlaylistById = async (id: number) => {
  const response = await axios.get(`${API_URL}/playlists/${id}`, getAuthHeaders());
  return response.data;
};

export const getPlaylists = async () => {
  const response = await axios.get(`${API_URL}/playlists`, getAuthHeaders());
  return response.data;
};

export const createPlaylist = async (playlist: FormData) => {
  const response = await axios.post(`${API_URL}/playlists`, playlist, getAuthHeaders());
  return response.data;
};

export const updatePlaylist = async (id: number, playlist: FormData) => {
  const token = localStorage.getItem('authToken');
  playlist.append('_method', 'PUT');
  const response = await axios.post(`${API_URL}/playlists/${id}`, playlist, {
    headers: {
      Authorization: `Bearer ${token}`,
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
