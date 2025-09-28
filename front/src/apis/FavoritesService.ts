import axios from 'axios';
import { API_URL } from './api';

const auth = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
});

export const getFavorites = async () => {
  const res = await axios.get(`${API_URL}/favorites`, auth());
  return res.data;
};

export const addFavorite = async (musicId: number) => {
  return axios.post(`${API_URL}/favorites/${musicId}`, {}, auth());
};

export const removeFavorite = async (musicId: number) => {
  return axios.delete(`${API_URL}/favorites/${musicId}`, auth());
};
