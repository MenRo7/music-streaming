import axios from 'axios';
import { API_URL } from '../apis/api';

const cleanToken = (t: string | null) => (t || '').replace(/^"+|"+$/g, '').trim();

const getAuthHeader = () => {
  const token = cleanToken(localStorage.getItem('authToken'));
  return {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  };
};

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

export const requestEmailChange = async (newEmail: string, currentPassword: string) => {
  return axios.post(
    `${API_URL}/account/email/change/request`,
    { new_email: newEmail, current_password: currentPassword },
    getAuthHeader()
  );
};

export const confirmEmailChange = async (token: string) => {
  return axios.get(`${API_URL}/account/email/change/confirm?token=${encodeURIComponent(token)}`);
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  return axios.post(
    `${API_URL}/account/password/change`,
    { current_password: currentPassword, new_password: newPassword },
    getAuthHeader()
  );
};
