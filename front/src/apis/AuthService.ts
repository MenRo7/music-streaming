import axios from 'axios';
import { API_URL } from '../apis/api';

export const registerUser = async (name: string, email: string, password: string) => {
  return axios.post(`${API_URL}/register`, { name, email, password });
};
