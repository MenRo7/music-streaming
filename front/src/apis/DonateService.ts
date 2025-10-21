import axios from 'axios';
import { API_URL } from './api';

const api = axios.create({ baseURL: API_URL });

export async function createDonationCheckoutSession(
  toUserId: number,
  amountCents: number,
  currency = 'eur'
) {
  const { data } = await api.post(`/users/${toUserId}/donate/checkout`, {
    amount_cents: amountCents,
    currency,
  }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
  });
  return data; // { id: sessionId }
}
