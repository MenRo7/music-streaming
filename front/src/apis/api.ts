import axios from 'axios';

axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.withCredentials = true;

export const API_URL = 'http://localhost:8000/api';

export default axios;
