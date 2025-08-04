import axios from 'axios';
import { API_URL } from './api';

export const createAlbum = async (formData: FormData) => {
  const token = localStorage.getItem('authToken');
  const response = await axios.post(`${API_URL}/album`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
