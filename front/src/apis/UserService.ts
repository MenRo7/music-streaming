import axios from 'axios';
import { API_URL } from '../apis/api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
  },
});

export const fetchUser = async () => {
  return axios.get(`${API_URL}/user`, getAuthHeader());
};

export const fetchUserSummary = async (userId: number) => {
  return axios.get(`${API_URL}/users/${userId}/summary`, getAuthHeader());
};

export const updateUserProfile = async (formData: FormData) => {
  return axios.post(`${API_URL}/user/update`, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getLikesSummary = async (): Promise<{
  profiles: never[];
  albums: { id: number; title: string; image: string | null }[];
  playlists: { id: number; title: string; image: string | null }[];
}> => {
  const res = await axios.get(`${API_URL}/likes/summary`, getAuthHeader());
  return res.data;
};

export const subscribeToUser = async (userId: number) => {
  const res = await axios.post(`${API_URL}/users/${userId}/subscribe`, {}, getAuthHeader());
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};

export const unsubscribeFromUser = async (userId: number) => {
  const res = await axios.delete(`${API_URL}/users/${userId}/subscribe`, getAuthHeader());
  window.dispatchEvent(new Event('likes:changed'));
  return res.data;
};

export const isSubscribedToUser = async (userId: number) => {
  const res = await axios.get(`${API_URL}/users/${userId}/subscribe`, getAuthHeader());
  return Boolean(res.data?.subscribed);
};