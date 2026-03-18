import {
  IProduct,
  IProductFilters,
  IUserPublic,
  IRegisterBody,
  ILoginBody,
  ICart,
  IDelivery,
  ICreateDeliveryBody,
} from '../types';

const BASE_URL = '/api';

// ───── Вспомогательная функция запроса ─────
async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include', // всегда отправляем куки
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json() as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? 'Something went wrong');
  }

  return data;
}

// ═══════════════════════════════════════
// USERS
// ═══════════════════════════════════════

interface IAuthResponse {
  message: string;
  user: IUserPublic;
}

interface IMeResponse {
  user: IUserPublic;
}

export async function apiRegister(
  body: IRegisterBody
): Promise<IAuthResponse> {
  return request<IAuthResponse>('/users/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiLogin(
  body: ILoginBody
): Promise<IAuthResponse> {
  return request<IAuthResponse>('/users/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiLogout(): Promise<{ message: string }> {
  return request<{ message: string }>('/users/logout', {
    method: 'POST',
  });
}

export async function apiGetMe(): Promise<IMeResponse> {
  return request<IMeResponse>('/users/me');
}

// ═══════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════

interface IProductsResponse {
  products: IProduct[];
}

interface IProductResponse {
  product: IProduct;
}

interface ICategoriesResponse {
  categories: string[];
}

export async function apiGetProducts(
  filters: Partial<IProductFilters> = {}
): Promise<IProductsResponse> {
  // Собираем query строку из фильтров
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.available !== null && filters.available !== undefined) {
    params.set('available', String(filters.available));
  }
  if (filters.sortByPrice) params.set('sortByPrice', filters.sortByPrice);
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    params.set('minPrice', String(filters.minPrice));
  }
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    params.set('maxPrice', String(filters.maxPrice));
  }

  const queryString = params.toString();
  const url = queryString ? `/products?${queryString}` : '/products';

  return request<IProductsResponse>(url);
}

export async function apiGetProductById(
  id: string
): Promise<IProductResponse> {
  return request<IProductResponse>(`/products/${id}`);
}

export async function apiGetCategories(): Promise<ICategoriesResponse> {
  return request<ICategoriesResponse>('/products/categories');
}

// ═══════════════════════════════════════
// CART
// ═══════════════════════════════════════

interface ICartResponse {
  cart: ICart;
}

export async function apiGetCart(): Promise<ICartResponse> {
  return request<ICartResponse>('/cart');
}

export async function apiAddToCart(
  productId: string,
  quantity: number
): Promise<ICartResponse> {
  return request<ICartResponse>('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function apiUpdateCartItem(
  productId: string,
  quantity: number
): Promise<ICartResponse> {
  return request<ICartResponse>(`/cart/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export async function apiRemoveFromCart(
  productId: string
): Promise<ICartResponse> {
  return request<ICartResponse>(`/cart/${productId}`, {
    method: 'DELETE',
  });
}

export async function apiClearCart(): Promise<{ message: string }> {
  return request<{ message: string }>('/cart', {
    method: 'DELETE',
  });
}

// ═══════════════════════════════════════
// DELIVERY
// ═══════════════════════════════════════

interface IDeliveryResponse {
  delivery: IDelivery;
}

interface IDeliveriesResponse {
  deliveries: IDelivery[];
}

export async function apiCreateDelivery(
  body: ICreateDeliveryBody
): Promise<IDeliveryResponse> {
  return request<IDeliveryResponse>('/delivery', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function apiGetMyDeliveries(): Promise<IDeliveriesResponse> {
  return request<IDeliveriesResponse>('/delivery');
}

export async function apiGetDeliveryById(
  id: string
): Promise<IDeliveryResponse> {
  return request<IDeliveryResponse>(`/delivery/${id}`);
}