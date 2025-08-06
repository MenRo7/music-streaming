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

export const createMusic = async (music: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/music`, music, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la musique :', error);
    throw error;
  }
};
