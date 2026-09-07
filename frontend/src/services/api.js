import axios from 'axios';

export class ApiError extends Error {
  constructor(message, status = 500, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const getAuthToken = () => {
  return localStorage.getItem('taskflow_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('taskflow_token', token);
  } else {
    localStorage.removeItem('taskflow_token');
  }
};

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: inject Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: unwrap response data & normalize errors
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || `Request failed with status ${status}`;
      const errors = data?.errors || null;
      return Promise.reject(new ApiError(message, status, errors));
    }
    return Promise.reject(new ApiError(error.message || 'Network communication error', 500));
  }
);

export const api = {
  getAuthToken,
  setAuthToken,

  // Auth endpoints
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  verifyResetToken: (token) => apiClient.get('/auth/verify-reset-token', { params: { token } }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),

  // Tasks endpoints
  getTasks: (params = {}) => {
    const cleanParams = {};
    if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.sortBy) cleanParams.sortBy = params.sortBy;
    if (params.order) cleanParams.order = params.order;
    if (params.search) cleanParams.search = params.search;

    return apiClient.get('/tasks', { params: cleanParams });
  },
  getTaskById: (id) => apiClient.get(`/tasks/${id}`),
  createTask: (taskData) => apiClient.post('/tasks', taskData),
  updateTask: (id, taskData) => apiClient.patch(`/tasks/${id}`, taskData),
  deleteTask: (id) => apiClient.delete(`/tasks/${id}`),

  // Categories endpoints
  getCategories: () => apiClient.get('/categories'),
  getCategoryById: (id) => apiClient.get(`/categories/${id}`),
  createCategory: (categoryData) => apiClient.post('/categories', categoryData),
  updateCategory: (id, categoryData) => apiClient.patch(`/categories/${id}`, categoryData),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`)
};
