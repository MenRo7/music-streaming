import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const fetchSongs = async () => {
  const response = await api.get('/songs');
  return response.data;
};

export default api;
