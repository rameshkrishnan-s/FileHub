import axios from "axios";

const BASE_URL = "http://localhost:5000";

// Create API instance
const API = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to include token
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
