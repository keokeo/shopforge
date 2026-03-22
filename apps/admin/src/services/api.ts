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

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
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
  get: (id: number) => api.get(`/products/${id}`),
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
};

export default api;
