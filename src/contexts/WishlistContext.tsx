/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { storeApi } from '@/lib/api';

interface WishlistContextValue {
  wishlistCount: number;
  isInWishlist: (bookId: string) => boolean;
  addToWishlist: (bookId: string) => Promise<void>;
  removeFromWishlist: (bookId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const idsRef = useRef<Set<string>>(new Set());
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(() => new Set());

  const commit = useCallback((update: (current: Set<string>) => Set<string>) => {
    const next = update(idsRef.current);
    idsRef.current = next;
    setWishlistIds(next);
  }, []);

  useEffect(() => {
    let active = true;

    if (!user) {
      commit(() => new Set());
      return () => { active = false; };
    }

    storeApi.wishlist.list()
      .then((items) => {
        if (active) commit(() => new Set(items.map((book) => String(book.id))));
      })
      .catch(() => {
        if (active) commit(() => new Set());
      });

    return () => { active = false; };
  }, [commit, user]);

  const addToWishlist = useCallback(async (bookId: string) => {
    const id = String(bookId);
    if (idsRef.current.has(id)) return;

    commit((current) => new Set(current).add(id));
    try {
      await storeApi.wishlist.add(id);
    } catch (error) {
      commit((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      throw error;
    }
  }, [commit]);

  const removeFromWishlist = useCallback(async (bookId: string) => {
    const id = String(bookId);
    const wasPresent = idsRef.current.has(id);

    if (wasPresent) {
      commit((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
    try {
      await storeApi.wishlist.remove(id);
    } catch (error) {
      if (wasPresent) commit((current) => new Set(current).add(id));
      throw error;
    }
  }, [commit]);

  const value = useMemo<WishlistContextValue>(() => ({
    wishlistCount: wishlistIds.size,
    isInWishlist: (bookId) => wishlistIds.has(String(bookId)),
    addToWishlist,
    removeFromWishlist,
  }), [addToWishlist, removeFromWishlist, wishlistIds]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
