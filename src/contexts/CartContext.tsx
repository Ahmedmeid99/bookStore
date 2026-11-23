/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { storeApi } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import type { CartItem } from '@/types/database';

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (bookId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  couponCode: string | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => Promise<void>;
  discount: number;
  shippingCost: number;
  total: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING = 50;

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  const clearCouponState = useCallback(() => {
    setCouponCode(null);
    setDiscount(0);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      clearCouponState();
      return;
    }
    setLoading(true);
    try {
      setItems((await storeApi.cart.get()).items);
    } catch {
      showError('تعذّر تحميل السلة');
    } finally {
      setLoading(false);
    }
  }, [user, clearCouponState, showError]);

  useEffect(() => { void refreshCart(); }, [refreshCart]);

  const addItem = useCallback(async (bookId: string, quantity = 1) => {
    if (!user) {
      showError('يجب تسجيل الدخول لإضافة منتجات للسلة');
      return;
    }
    try {
      setItems((await storeApi.cart.add(bookId, quantity)).items);
      clearCouponState();
      success('تمت الإضافة إلى السلة');
      setCartOpen(true);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'تعذّر إضافة المنتج للسلة');
    }
  }, [user, success, showError, clearCouponState]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      setItems((await storeApi.cart.update(itemId, quantity)).items);
      clearCouponState();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'تعذّر تحديث الكمية');
    }
  }, [showError, clearCouponState]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setItems((await storeApi.cart.remove(itemId)).items);
      clearCouponState();
    } catch {
      showError('تعذّر حذف المنتج');
    }
  }, [showError, clearCouponState]);

  const clearCart = useCallback(async () => {
    if (!user) return;
    try {
      setItems((await storeApi.cart.clear()).items);
      clearCouponState();
    } catch {
      showError('تعذّر تفريغ السلة');
    }
  }, [user, showError, clearCouponState]);

  const subtotal = useMemo(() => items.reduce((sum, item) => {
    const price = item.book?.sale_price ?? item.book?.regular_price ?? 0;
    return sum + price * item.quantity;
  }, 0), [items]);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      const coupon = await storeApi.cart.coupon(code);
      setCouponCode(coupon.code);
      setDiscount(Number(coupon.discountAmount));
      return { success: true, message: 'تم تطبيق كود الخصم' };
    } catch (error) {
      clearCouponState();
      return { success: false, message: error instanceof Error ? error.message : 'كود الخصم غير صحيح' };
    }
  }, [clearCouponState]);

  const removeCoupon = useCallback(async () => clearCouponState(), [clearCouponState]);
  const afterDiscount = Math.max(0, subtotal - discount);
  const shippingCost = afterDiscount >= FREE_SHIPPING_THRESHOLD || afterDiscount === 0 ? 0 : FLAT_SHIPPING;
  const total = afterDiscount + shippingCost;
  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo<CartContextValue>(() => ({
    items, loading, cartOpen, setCartOpen, addItem, updateQuantity, removeItem, clearCart, refreshCart,
    itemCount, subtotal, couponCode, applyCoupon, removeCoupon, discount, shippingCost, total,
  }), [items, loading, cartOpen, addItem, updateQuantity, removeItem, clearCart, refreshCart, itemCount, subtotal, couponCode, applyCoupon, removeCoupon, discount, shippingCost, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
