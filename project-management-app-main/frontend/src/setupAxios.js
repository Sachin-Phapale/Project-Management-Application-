import http from './http-common';
import AuthService from './services/auth.service';

// Add a request interceptor to add the auth token to requests
http.interceptors.request.use(
  (config) => {
    const user = AuthService.getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized responses
http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      AuthService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default http;
