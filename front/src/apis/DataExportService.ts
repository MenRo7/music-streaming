import axios from 'axios';
import { API_URL } from './api';

const cleanToken = (t: string | null) => (t || '').replace(/^"+|"+$/g, '').trim();
const getAuthHeaders = () => {
  const token = cleanToken(localStorage.getItem('authToken'));
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const exportUserData = async (): Promise<void> => {
  try {
    const response = await axios.get(`${API_URL}/account/data/export`, {
      responseType: 'blob',
      withCredentials: true,
      headers: getAuthHeaders(),
    });
    const contentDisposition = response.headers['content-disposition'] || '';
    const match = /filename="?([^"]+)"?/i.exec(contentDisposition);
    const filename = match?.[1] || 'rhapsody_data_export.json';
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
      throw new Error('Unauthenticated');
    }
    throw error;
  }
};

export const getUserDataSummary = async (): Promise<any> => {
  const response = await axios.get(`${API_URL}/account/data/summary`, {
    withCredentials: true,
    headers: getAuthHeaders(),
  });
  return response.data;
};
