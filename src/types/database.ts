// Database types — mirror the Supabase schema for type-safe queries.

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name_ar: string;
  name_en: string | null;
  photo_url: string | null;
  bio_ar: string | null;
  bio_en: string | null;
  country: string | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string;
  description_ar: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  isbn_10: string | null;
  isbn_13: string | null;
  publisher: string | null;
  publication_year: number | null;
  language: string;
  page_count: number | null;
  cover_url: string | null;
  regular_price: number;
  sale_price: number | null;
  stock_quantity: number;
  average_rating: number;
  rating_count: number;
  featured: boolean;
  bestseller: boolean;
  active: boolean;
  source_name: string | null;
  source_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  authors?: Author[];
  categories?: Category[];
}

export interface BookWithRelations extends Book {
  authors: Author[];
  categories: Category[];
}

export interface Address {
  id: string;
  user_id: string;
  label: string | null;
  full_name: string;
  phone: string;
  governorate: string;
  city: string;
  district: string | null;
  street_address: string;
  building_no: string | null;
  floor: string | null;
  apartment: string | null;
  postal_code: string | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: string;
  user_id: string;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  book_id: string;
  quantity: number;
  created_at: string;
  book?: Book;
}

export interface Wishlist {
  id: string;
  user_id: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  book_id: string;
  created_at: string;
  book?: Book;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  coupon_code: string | null;
  payment_method: 'cod' | 'online';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  shipping_full_name: string | null;
  shipping_phone: string | null;
  shipping_governorate: string | null;
  shipping_city: string | null;
  shipping_district: string | null;
  shipping_street_address: string | null;
  shipping_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  book_id: string | null;
  title_ar: string;
  title_en: string | null;
  cover_url: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description_ar: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: 'pending' | 'published' | 'hidden';
  created_at: string;
  updated_at: string;
  profiles?: { display_name: string | null };
}

export type Language = 'ar' | 'en';
export type Currency = 'EGP' | 'USD' | 'EUR' | 'SAR';
