// axiosInstance.js
import axios from 'axios';
import { API_BASE_URL } from './api'; // Import the centralized URL

// Create a pre-configured Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;