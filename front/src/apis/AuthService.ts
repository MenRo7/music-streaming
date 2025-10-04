import axios from 'axios';
import { API_URL } from '../apis/api';

export const registerUser = (
  name: string,
  email: string,
  password: string,
  date_of_birth: string
) =>
  axios.post(`${API_URL}/register`, {
    name,
    email,
    password,
    date_of_birth,
  });

export const verifyEmail = (email: string, code: string) =>
  axios.post(`${API_URL}/verify-email`, { email, code });

export const resendEmailCode = (email: string) =>
  axios.post(`${API_URL}/resend-email-code`, { email });

export const loginRequest = (email: string, password: string) =>
  axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });

export const verify2fa = (email: string, code: string) =>
  axios.post(`${API_URL}/login/verify`, { email, code });

export const resend2fa = (email: string) =>
  axios.post(`${API_URL}/login/resend`, { email });

export const forgotPassword = (email: string) =>
  axios.post(`${API_URL}/password/forgot`, { email });

export const resetPassword = (
  email: string,
  code: string,
  password: string,
  password_confirmation: string
) =>
  axios.post(`${API_URL}/password/reset`, {
    email,
    code,
    password,
    password_confirmation,
  });
