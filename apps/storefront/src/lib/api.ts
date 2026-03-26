/**
 * API 客户端封装
 * 统一处理请求、错误和认证
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      data?.detail || `请求失败: ${response.status}`,
      response.status,
      data
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ====== 商品 API ======

export const productsApi = {
  list: (params?: { page?: number; page_size?: number; category_id?: number; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.page_size) query.set('page_size', String(params.page_size));
    if (params?.category_id) query.set('category_id', String(params.category_id));
    if (params?.search) query.set('search', params.search);
    return request<any>(`/products?${query.toString()}`);
  },
  get: (id: number) => request<any>(`/products/${id}`),
  getBySlug: (slug: string) => request<any>(`/products/slug/${slug}`),
};

// ====== 分类 API ======

export const categoriesApi = {
  list: () => request<any[]>('/categories'),
  get: (id: number) => request<any>(`/categories/${id}`),
};

// ====== SKU API ======

export const skusApi = {
  list: (productId: number) => request<any[]>(`/products/${productId}/skus`),
  getAttributes: (productId: number) => request<any[]>(`/products/${productId}/attributes`),
};

// ====== 购物车 API ======

export const cartApi = {
  list: (token: string) => request<any[]>('/cart', { token }),
  add: (token: string, data: { sku_id: number; quantity: number }) =>
    request<any>('/cart', { method: 'POST', body: JSON.stringify(data), token }),
  update: (token: string, itemId: number, quantity: number) =>
    request<any>(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }), token }),
  remove: (token: string, itemId: number) =>
    request<any>(`/cart/${itemId}`, { method: 'DELETE', token }),
  clear: (token: string) =>
    request<any>('/cart', { method: 'DELETE', token }),
};

// ====== 订单 API ======

export const ordersApi = {
  create: (token: string, data: any) =>
    request<any>('/orders', { method: 'POST', body: JSON.stringify(data), token }),
  list: (token: string, params?: { page?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.status) query.set('status', params.status);
    return request<any>(`/orders?${query.toString()}`, { token });
  },
  get: (token: string, id: number) => request<any>(`/orders/${id}`, { token }),
};

// ====== 认证 API ======

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.set('username', username);
    formData.set('password', password);
    return request<any>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
  },
  me: (token: string) => request<any>('/auth/me', { token }),
  refresh: (refreshToken: string) =>
    request<any>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};
