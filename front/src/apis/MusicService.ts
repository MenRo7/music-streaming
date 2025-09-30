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

export const createMusic = async (music: FormData) => {
  const response = await axios.post(`${API_URL}/music`, music, {
    ...getAuthHeaders(),
    headers: {
      ...getAuthHeaders().headers,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const checkTracksExist = async (ids: number[]): Promise<number[]> => {
  const token = cleanToken(localStorage.getItem('authToken'));
  const res = await fetch(`${API_URL}/music/exists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error('checkTracksExist failed');
  const data = await res.json();
  return Array.isArray(data?.exists) ? data.exists.map(Number) : [];
};
