import axios from 'axios';
import { API_URL } from './api';

const api = axios.create({ baseURL: API_URL });

const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    Accept: 'application/json',
  },
});

export async function getPreferences() {
  const { data } = await api.get('/preferences', auth());
  return data;
}

export async function setLocale(locale: 'fr' | 'en') {
  const { data } = await api.post('/preferences/locale', { locale }, auth());
  return data;
}

export async function getStripeStatus() {
  const { data } = await api.get('/preferences/stripe/status', auth());
  return data;
}

export async function startStripeOnboarding() {
  const { data } = await api.post('/preferences/stripe/onboarding', {}, auth());
  return data; // { onboarding_url, account_id }
}
