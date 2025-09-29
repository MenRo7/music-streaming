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

export const getFavorites = async () => {
  const res = await axios.get(`${API_URL}/favorites`, getAuthHeaders());
  return res.data;
};

export const addFavorite = async (musicId: number) => {
  return axios.post(`${API_URL}/favorites/${musicId}`, {}, getAuthHeaders());
};

export const removeFavorite = async (musicId: number) => {
  return axios.delete(`${API_URL}/favorites/${musicId}`, getAuthHeaders());
};
