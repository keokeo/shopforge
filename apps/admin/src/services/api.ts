/**
 * API 接口封装 (管理后台)
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器 - 自动附加 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 401 时尝试 refresh token，失败则跳转登录
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('admin_refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // 已经在刷新中，排队等待
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = res.data;
        localStorage.setItem('admin_token', access_token);
        localStorage.setItem('admin_refresh_token', newRefreshToken);

        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ====== 认证 ======
export const authApi = {
  login: (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.set('username', username);
    formData.set('password', password);
    return api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  me: () => api.get('/auth/me'),
};

// ====== 商品 ======
export const productsApi = {
  list: (params?: any) => api.get('/products', { params }),
  get: (id: number) => api.get(`/products/${id}`, { params: { include_inactive: true } }),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// ====== 分类 ======
export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: number, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// ====== SKU ======
export const skusApi = {
  list: (productId: number) => api.get(`/products/${productId}/skus`),
  create: (productId: number, data: any) => api.post(`/products/${productId}/skus`, data),
  update: (productId: number, skuId: number, data: any) => api.put(`/products/${productId}/skus/${skuId}`, data),
  delete: (productId: number, skuId: number) => api.delete(`/products/${productId}/skus/${skuId}`),
  getAttributes: (productId: number) => api.get(`/products/${productId}/attributes`),
  createAttribute: (productId: number, data: any) => api.post(`/products/${productId}/attributes`, data),
};

// ====== 订单 ======
export const ordersApi = {
  list: (params?: any) => api.get('/orders/admin', { params }),
  get: (id: number) => api.get(`/orders/${id}`),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
};

// ====== 用户 ======
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
};

// ====== 上传 ======
export const uploadApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  images: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (filename: string) =>
    api.delete('/upload/image', { params: { filename } }),
};

// ====== 控制台 ======
export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

export default api;
