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

export const updateUserProfile = async (formData: FormData) => {
  return axios.post(`${API_URL}/user/update`, formData, {
    ...getAuthHeader(),
    headers: {
      ...getAuthHeader().headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};
