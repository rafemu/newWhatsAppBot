import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Adding helper functions to handle Rate Limiting and request duplication issues

// Function to handle rate limiting
api.interceptors.response.use(
  response => response,
  error => {
    const { status } = error.response;
    if (status === 429) {
      // Handle rate limiting error
      console.error('Rate limit exceeded. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Function to handle request duplication
const requestQueue = new Map();

const addToRequestQueue = (config) => {
  const key = JSON.stringify(config);
  if (!requestQueue.has(key)) {
    requestQueue.set(key, axios(config));
  }
  return requestQueue.get(key);
};

const removeFromRequestQueue = (config) => {
  const key = JSON.stringify(config);
  requestQueue.delete(key);
};

api.interceptors.request.use(
  config => {
    const request = addToRequestQueue(config);
    request.then(() => removeFromRequestQueue(config));
    return request;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;
