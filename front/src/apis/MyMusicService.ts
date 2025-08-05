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

export const getUserMusics = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-musics`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des musiques :", error);
    throw error;
  }
};

export const getUserAlbums = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-albums`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des albums :", error);
    throw error;
  }
};
