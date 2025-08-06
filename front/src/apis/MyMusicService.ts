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

export const deleteMusic = async (id: number) => {
  try {
    const response = await axios.delete(`${API_URL}/music/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de la musique :", error);
    throw error;
  }
};

export const updateMusic = async (id: number, data: FormData) => {
  const token = localStorage.getItem('authToken');
  data.append('_method', 'PUT');

  try {
    const response = await axios.post(`${API_URL}/music/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la musique :", error);
    throw error;
  }
};
