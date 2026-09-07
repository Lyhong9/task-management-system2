const BASE_URL = '/api';

class ApiError extends Error {
  constructor(message, status, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

const getAuthToken = () => {
  return localStorage.getItem('taskflow_token');
};

const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('taskflow_token', token);
  } else {
    localStorage.removeItem('taskflow_token');
  }
};

const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed with status ${response.status}`,
        response.status,
        data.errors || null
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error occurred', 500);
  }
};

export const api = {
  getAuthToken,
  setAuthToken,

  // Auth endpoints
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: data }),
  verifyResetToken: (token) => request(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`, { method: 'GET' }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: data }),


  // Tasks endpoints
  getTasks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    return request(`/tasks${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },
  getTaskById: (id) => request(`/tasks/${id}`, { method: 'GET' }),
  createTask: (taskData) => request('/tasks', { method: 'POST', body: taskData }),
  updateTask: (id, taskData) => request(`/tasks/${id}`, { method: 'PATCH', body: taskData }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Categories endpoints
  getCategories: () => request('/categories', { method: 'GET' }),
  getCategoryById: (id) => request(`/categories/${id}`, { method: 'GET' }),
  createCategory: (categoryData) => request('/categories', { method: 'POST', body: categoryData }),
  updateCategory: (id, categoryData) => request(`/categories/${id}`, { method: 'PATCH', body: categoryData }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' })
};
