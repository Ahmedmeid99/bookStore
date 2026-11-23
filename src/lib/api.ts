import type {
  Address, Author, Book, CartItem, Category, Order, Profile, Review,
} from '@/types/database';

const API_BASE = (import.meta.env.VITE_API_URL).replace(/\/$/, '');
const API_ORIGIN = new URL(API_BASE, window.location.origin).origin;
const TOKEN_KEY = 'bookstore.accessToken';
let refreshPromise: Promise<string> | null = null;

interface Envelope<T> { data: T; message: string; }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}, canRefresh = true): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && canRefresh && !path.startsWith('/auth/')) {
    try {
      const token = await refreshAccessToken();
      authToken.set(token);
      return request<T>(path, init, false);
    } catch {
      authToken.clear();
      window.dispatchEvent(new Event('bookstore:unauthorized'));
    }
  }
  if (!response.ok) {
    let message = response.statusText || 'Request failed';
    try {
      const problem = await response.json() as { title?: string; detail?: string; errors?: Record<string, string[]> };
      message = problem.title || problem.detail || Object.values(problem.errors || {}).flat()[0] || message;
    } catch { /* response has no JSON body */ }
    if (response.status === 401 && !path.startsWith('/auth/')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('bookstore:unauthorized'));
    }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json() as Envelope<T>).data;
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new ApiError('The session has expired.', response.status);
        const envelope = await response.json() as Envelope<{ accessToken: string }>;
        return envelope.data.accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

function body(value: unknown): RequestInit {
  return { body: JSON.stringify(value) };
}

interface ApiAuthor { id: number; name: string; biography: string | null; photoUrl: string | null; }
interface ApiCategory { id: number; name: string; slug: string; description: string | null; displayOrder: number; }
interface ApiBook {
  id: number; slug: string; title: string; description: string | null; isbn10: string | null; isbn13: string;
  publisher: string | null; publicationYear: number | null; language: string; pageCount: number | null; format: string;
  coverUrl: string | null; regularPrice: number; salePrice: number | null; stockQuantity: number; averageRating: number;
  ratingCount: number; featured: boolean; bestseller: boolean; active: boolean; createdAt: string;
  authors: ApiAuthor[]; categories: ApiCategory[];
}

interface ApiProfile { id: string; email: string; displayName: string; phone: string | null; isAdmin: boolean; createdAt: string; }
interface ApiAuth { accessToken: string; profile: ApiProfile; }
interface ApiReview { id: number; bookId: number; userId: string; rating: number; title: string | null; body: string | null; status: string; displayName: string; createdAt: string; }
interface ApiCart { id: string; items: { id: number; quantity: number; unitPrice: number; book: ApiBook; addedAt: string }[]; subtotal: number; }
interface ApiCoupon { code: string; discountType: string; discountValue: number; discountAmount: number; }
interface ApiAddress { id: number; label: string | null; fullName: string; phone: string; governorate: string; city: string; district: string | null; streetAddress: string; streetLine2: string | null; postalCode: string | null; isDefault: boolean; createdAt: string; }
interface ApiOrder {
  id: number; orderNumber: string; status: string; paymentStatus: string; paymentMethod: string; subtotal: number;
  discount: number; shippingCost: number; tax: number; total: number; customerName: string; customerPhone: string;
  shippingAddress: string | null; createdAt: string;
  items: { id: number; bookId: number | null; title: string; coverUrl: string | null; price: number; quantity: number }[];
}

const mapAuthor = (author: ApiAuthor): Author => ({
  id: String(author.id), name_ar: author.name, name_en: null, photo_url: resolveMediaUrl(author.photoUrl), bio_ar: author.biography, bio_en: null,
  country: null, featured: true, created_at: '', updated_at: '',
});

const mapCategory = (category: ApiCategory): Category => ({
  id: String(category.id), name_ar: category.name, name_en: null, slug: category.slug,
  description_ar: category.description, icon: null, sort_order: category.displayOrder, created_at: '', updated_at: '',
});

const mapBook = (book: ApiBook): Book => ({
  id: String(book.id), slug: book.slug, title_ar: book.title, title_en: null,
  description_ar: book.description, description_en: null, isbn_10: book.isbn10, isbn_13: book.isbn13,
  publisher: book.publisher, publication_year: book.publicationYear, language: book.language, page_count: book.pageCount,
  cover_url: resolveMediaUrl(book.coverUrl), regular_price: Number(book.regularPrice), sale_price: book.salePrice == null ? null : Number(book.salePrice),
  stock_quantity: book.stockQuantity, average_rating: Number(book.averageRating), rating_count: book.ratingCount,
  featured: book.featured, bestseller: book.bestseller, active: book.active, source_name: null, source_id: null,
  created_at: book.createdAt, updated_at: book.createdAt,
  authors: book.authors.map(mapAuthor), categories: book.categories.map(mapCategory),
});

const mapProfile = (profile: ApiProfile): Profile => ({
  id: profile.id, email: profile.email, display_name: profile.displayName, phone: profile.phone,
  role: profile.isAdmin ? 'admin' : 'customer', created_at: profile.createdAt, updated_at: profile.createdAt,
});

const mapReview = (review: ApiReview): Review => ({
  id: String(review.id), book_id: String(review.bookId), user_id: review.userId, rating: review.rating,
  title: review.title, body: review.body, status: review.status.toLowerCase() === 'published' ? 'published' : 'pending',
  created_at: review.createdAt, updated_at: review.createdAt, profiles: { display_name: review.displayName },
});

const mapCart = (cart: ApiCart): { id: string; items: CartItem[]; subtotal: number } => ({
  id: cart.id,
  subtotal: Number(cart.subtotal),
  items: cart.items.map((item) => ({
    id: String(item.id), cart_id: cart.id, book_id: String(item.book.id), quantity: item.quantity,
    created_at: item.addedAt, book: mapBook(item.book),
  })),
});

const mapAddress = (address: ApiAddress): Address => ({
  id: String(address.id), user_id: '', label: address.label, full_name: address.fullName, phone: address.phone,
  governorate: address.governorate, city: address.city, district: address.district,
  street_address: address.streetAddress, building_no: address.streetLine2, floor: null, apartment: null,
  postal_code: address.postalCode, notes: null, is_default: address.isDefault,
  created_at: address.createdAt, updated_at: address.createdAt,
});

const mapOrder = (order: ApiOrder): Order => ({
  id: String(order.id), order_number: order.orderNumber, user_id: '', status: normalizeOrderStatus(order.status),
  subtotal: Number(order.subtotal), discount: Number(order.discount), shipping_cost: Number(order.shippingCost),
  tax: Number(order.tax), total: Number(order.total), coupon_code: null,
  payment_method: order.paymentMethod as Order['payment_method'], payment_status: normalizePaymentStatus(order.paymentStatus),
  shipping_full_name: order.customerName, shipping_phone: order.customerPhone, shipping_governorate: null,
  shipping_city: null, shipping_district: null, shipping_street_address: order.shippingAddress,
  shipping_notes: null, notes: null, created_at: order.createdAt, updated_at: order.createdAt,
  order_items: order.items.map((item) => ({
    id: String(item.id), order_id: String(order.id), book_id: item.bookId == null ? null : String(item.bookId),
    title_ar: item.title, title_en: null, cover_url: resolveMediaUrl(item.coverUrl), price: Number(item.price), quantity: item.quantity,
    created_at: order.createdAt,
  })),
});

function normalizeOrderStatus(status: string): Order['status'] {
  const value = status.toLowerCase();
  if (value === 'ready') return 'processing';
  if (value === 'completed') return 'delivered';
  if (value === 'refunded') return 'cancelled';
  return value as Order['status'];
}

function normalizePaymentStatus(status: string): Order['payment_status'] {
  const value = status.toLowerCase();
  if (value === 'paid') return 'paid';
  if (value.includes('refund')) return 'refunded';
  return 'unpaid';
}

function resolveMediaUrl(value: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return new URL(value, API_ORIGIN).toString();
}

export interface CatalogRequest {
  search?: string; category?: string; authorId?: string; language?: string; minPrice?: string; maxPrice?: string;
  year?: string; minRating?: string; inStock?: boolean; sort?: string; pageNumber?: number; pageSize?: number;
}

function queryString(values: object): string {
  const params = new URLSearchParams();
  Object.entries(values as Record<string, string | number | boolean | undefined>).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== false) params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const authToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const storeApi = {
  home: async () => {
    const value = await request<{ featured: ApiBook[]; bestsellers: ApiBook[]; newReleases: ApiBook[]; offers: ApiBook[]; authors: ApiAuthor[]; categories: ApiCategory[]; bookCount: number; authorCount: number }>('/storefront/home');
    return { ...value, featured: value.featured.map(mapBook), bestsellers: value.bestsellers.map(mapBook), newReleases: value.newReleases.map(mapBook), offers: value.offers.map(mapBook), authors: value.authors.map(mapAuthor), categories: value.categories.map(mapCategory) };
  },
  catalog: async (values: CatalogRequest) => {
    const result = await request<{ items: ApiBook[]; totalCount: number; pageNumber: number; pageSize: number }>(`/storefront/catalog${queryString(values)}`);
    return { ...result, items: result.items.map(mapBook) };
  },
  book: async (slug: string) => {
    const value = await request<{ book: ApiBook; related: ApiBook[]; reviews: ApiReview[]; userReview: ApiReview | null; inWishlist: boolean }>(`/storefront/books/${encodeURIComponent(slug)}`);
    return { book: mapBook(value.book), related: value.related.map(mapBook), reviews: value.reviews.map(mapReview), userReview: value.userReview ? mapReview(value.userReview) : null, inWishlist: value.inWishlist };
  },
  categories: async () => (await request<ApiCategory[]>('/storefront/categories')).map(mapCategory),
  authors: async () => (await request<ApiAuthor[]>('/storefront/authors')).map(mapAuthor),
  auth: {
    login: async (email: string, password: string) => {
      const result = await request<ApiAuth>('/auth/storefront-login', { method: 'POST', ...body({ email, password }) });
      authToken.set(result.accessToken);
      return { token: result.accessToken, profile: mapProfile(result.profile) };
    },
    register: async (email: string, password: string, displayName: string) => {
      const result = await request<ApiAuth>('/auth/register', { method: 'POST', ...body({ email, password, displayName }) });
      authToken.set(result.accessToken);
      return { token: result.accessToken, profile: mapProfile(result.profile) };
    },
    profile: async () => mapProfile(await request<ApiProfile>('/customer/profile')),
    updateProfile: async (displayName: string, phone: string) => mapProfile(await request<ApiProfile>('/customer/profile', { method: 'PUT', ...body({ displayName, phone }) })),
    logout: async () => request<void>('/auth/logout', { method: 'POST' }, false),
    forgotPassword: async (email: string) => request<void>('/auth/forgot-password', { method: 'POST', ...body({ email }) }),
  },
  cart: {
    get: async () => mapCart(await request<ApiCart>('/customer/cart')),
    add: async (bookId: string, quantity: number) => mapCart(await request<ApiCart>('/customer/cart/items', { method: 'POST', ...body({ bookId: Number(bookId), quantity }) })),
    update: async (itemId: string, quantity: number) => mapCart(await request<ApiCart>(`/customer/cart/items/${itemId}`, { method: 'PUT', ...body({ quantity }) })),
    remove: async (itemId: string) => mapCart(await request<ApiCart>(`/customer/cart/items/${itemId}`, { method: 'DELETE' })),
    clear: async () => mapCart(await request<ApiCart>('/customer/cart', { method: 'DELETE' })),
    coupon: async (code: string) => request<ApiCoupon>('/customer/cart/coupon', { method: 'POST', ...body({ code }) }),
  },
  wishlist: {
    list: async () => (await request<{ id: number; book: ApiBook; addedAt: string }[]>('/customer/wishlist')).map((item) => mapBook(item.book)),
    add: async (bookId: string) => request<void>(`/customer/wishlist/${bookId}`, { method: 'POST' }),
    remove: async (bookId: string) => request<void>(`/customer/wishlist/${bookId}`, { method: 'DELETE' }),
  },
  reviews: {
    create: async (bookId: string, rating: number, title: string, reviewBody: string) => mapReview(await request<ApiReview>('/customer/reviews', { method: 'POST', ...body({ bookId: Number(bookId), rating, title: title || null, body: reviewBody || null }) })),
  },
  addresses: {
    list: async () => (await request<ApiAddress[]>('/customer/addresses')).map(mapAddress),
    create: async (value: Partial<Address>) => mapAddress(await request<ApiAddress>('/customer/addresses', { method: 'POST', ...body(addressPayload(value)) })),
    update: async (id: string, value: Partial<Address>) => mapAddress(await request<ApiAddress>(`/customer/addresses/${id}`, { method: 'PUT', ...body(addressPayload(value)) })),
    remove: async (id: string) => request<void>(`/customer/addresses/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: async () => (await request<ApiOrder[]>('/customer/orders')).map(mapOrder),
    get: async (orderNumber: string) => mapOrder(await request<ApiOrder>(`/customer/orders/${encodeURIComponent(orderNumber)}`)),
    place: async (value: { full_name: string; phone: string; governorate: string; city: string; district: string; street_address: string; notes: string; payment_method: string; coupon_code: string | null; save_address: boolean }) => mapOrder(await request<ApiOrder>('/customer/orders', {
      method: 'POST',
      ...body({ fullName: value.full_name, phone: value.phone, governorate: value.governorate, city: value.city, district: value.district || null, streetAddress: value.street_address, notes: value.notes || null, paymentMethod: value.payment_method, couponCode: value.coupon_code, saveAddress: value.save_address }),
    })),
  },
};

function addressPayload(value: Partial<Address>) {
  return {
    label: value.label || null, fullName: value.full_name, phone: value.phone, governorate: value.governorate,
    city: value.city, district: value.district || null, streetAddress: value.street_address,
    streetLine2: value.building_no || null, postalCode: value.postal_code || null, isDefault: Boolean(value.is_default),
  };
}
