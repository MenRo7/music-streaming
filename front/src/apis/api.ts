import axios from 'axios';
import ENV from '../config/env';

axios.defaults.baseURL = ENV.API_URL;
axios.defaults.withCredentials = true;

export const API_URL = ENV.API_URL;

export default axios;
