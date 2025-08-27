import axios from 'axios';

const axiosInstance = axios.create({
  //baseURL: 'http://localhost:5001', // local
  baseURL: 'http://3.107.86.184:5001', // live
  headers: { 'Content-Type': 'application/json' },
});
axiosInstance.interceptors.request.use(
  config => {
    // Grab token from localStorage (or wherever you store it)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;
// 16.176.224.120
// 3.106.124.52npm