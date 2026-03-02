import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim() || 'http://localhost:5000/api';

const localClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to add the token to the header
localClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  users: {
    list: async () => {
      const response = await localClient.get('/people');
      return response.data.data;
    },
    get: async (id) => {
      const response = await localClient.get(`/people/id/${id}`);
      return response.data.data;
    },
    update: async (id, data) => {
      const response = await localClient.put(`/people/id/${id}`, data);
      return response.data.data;
    },
    search: async (query) => {
      const response = await localClient.get('/people/search', { params: { query } });
      return response.data.data;
    }
  },
  auth: {
    login: async (credentials) => {
      const response = await localClient.post('/auth/login', credentials);
      // Return the full response data so AuthContext can see mongo_id, email, etc.
      return response.data;
    },
    signup: async (data) => {
      const response = await localClient.post('/auth/signup', data);
      // Return the full response data
      return response.data;
    },
    googleLogin: async (idToken) => {
      const response = await localClient.post('/auth/google-login', { idToken });
      const { token, user } = response.data;
      if (token) localStorage.setItem('token', token);
      return response.data;
    },
    googleSignup: async (idToken) => {
      const response = await localClient.post('/auth/google-signup', { idToken });
      const { token, user } = response.data;
      if (token) localStorage.setItem('token', token);
      return response.data;
    },
    getProfileByEmail: async (email) => {
      const response = await localClient.get(`/auth/profile?email=${encodeURIComponent(email)}`);
      return response.data;
    },
    getProfileById: async (id) => {
      const response = await localClient.get(`/people/id/${id}`);
      return response.data.data || response.data;
    },
    updateProfileById: async (id, data) => {
      const response = await localClient.put(`/people/id/${id}`, data);
      return response.data.data || response.data;
    },
    uploadProfilePhotoById: async (id, file) => {
      const formData = new FormData();
      formData.append('photo', file);
      const response = await localClient.post(`/people/id/${id}/profile-photo`, formData);
      return response.data.data || response.data;
    },
    deleteProfileById: async (id) => {
      const response = await localClient.delete(`/people/id/${id}`);
      return response.data;
    },
    forgotPassword: async (email) => {
      const response = await localClient.post('/auth/forgot-password', { email });
      return response.data;
    },
    updatePassword: async (data) => {
      const response = await localClient.post('/auth/update-password', data);
      return response.data;
    },
    me: async () => {
      const response = await localClient.get('/auth/me');
      return response.data.data || response.data.user;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('sessionStartedAt');
    }
  },
  blogs: {
    list: async () => {
      const response = await localClient.get('/blogs');
      return response.data.data || response.data;
    },
    create: async (data) => {
      const response = await localClient.post('/blogs', data);
      return response.data.data || response.data;
    },
    uploadImages: async (files) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('images', file);
      });
      const response = await localClient.post('/blogs/upload-images', formData);
      return response.data;
    },
    getByUser: async (email) => {
      const response = await localClient.get(`/blogs/user/${encodeURIComponent(email)}`);
      return response.data.data || response.data;
    },
    update: async (id, data) => {
      const response = await localClient.put(`/blogs/${id}`, data);
      return response.data.data || response.data;
    },
    delete: async (id) => {
      const response = await localClient.delete(`/blogs/${id}`);
      return response.data.data || response.data;
    }
  }
};

export default api;
