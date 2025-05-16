import axios from 'axios';
import { API_URL } from './api';

export interface Album {
  id: string;
  title: string;
  image: string;
  artist_name?: string;
  songs?: Song[];
}

export interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  dateAdded: string;
  duration: string;
  audio?: string;
}

export const getAlbumById = async (id: string): Promise<Album> => {
  const response = await axios.get(`${API_URL}/albums/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  });
  return response.data;
};

