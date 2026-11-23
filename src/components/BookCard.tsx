import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { BookCover } from './BookCover';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '@/lib/utils';
import { storeApi } from '@/lib/api';
import type { Book } from '@/types/database';

interface BookCardProps {
  book: Book;
  variant?: 'grid' | 'list';
}

export function BookCard({ book, variant = 'grid' }: BookCardProps) {
  const { lang, currency, t } = useLanguage();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { success, warning } = useToast();
  const discount = getDiscountPercent(book);
  const price = getEffectivePrice(book);
  const authorName = book.authors?.[0]
    ? lang === 'ar' ? book.authors[0].name_ar : (book.authors[0].name_en || book.authors[0].name_ar)
    : '';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      warning('يجب تسجيل الدخول أولاً');
      return;
    }
    if (book.stock_quantity <= 0) {
      warning('هذا الكتاب غير متوفر حاليًا');
      return;
    }
    await addItem(book.id, 1);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      warning('يجب تسجيل الدخول أولاً');
      return;
    }
    try {
      await storeApi.wishlist.add(book.id);
      success('تمت الإضافة إلى المفضلة');
    } catch (error) {
      warning(error instanceof Error ? error.message : 'تعذّرت الإضافة إلى المفضلة');
    }
  };

  if (variant === 'list') {
    return (
      <Link
        to={`/book/${book.slug}`}
        className="card group flex gap-4 p-4 transition-all hover:shadow-md"
      >
        <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg">
          <BookCover coverUrl={book.cover_url} title={book.title_ar} className="h-32 w-24" />
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="font-semibold text-navy-800 line-clamp-2 group-hover:text-burgundy-600">
              {lang === 'ar' ? book.title_ar : (book.title_en || book.title_ar)}
            </h3>
            {authorName && <p className="mt-1 text-sm text-navy-500">{authorName}</p>}
            {book.description_ar && (
              <p className="mt-2 text-sm text-navy-600 line-clamp-2">
                {lang === 'ar' ? book.description_ar : (book.description_en || book.description_ar)}
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-burgundy-700">{formatPrice(price, currency, lang)}</span>
              {discount > 0 && (
                <span className="text-xs text-navy-400 line-through">{formatPrice(book.regular_price, currency, lang)}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {book.bestseller && (
                <span className="badge bg-gold-100 text-gold-700">{lang === 'ar' ? 'الأكثر مبيعًا' : 'Bestseller'}</span>
              )}
              <button
                onClick={handleAddToCart}
                disabled={book.stock_quantity <= 0}
                className="btn-primary !px-3 !py-2"
                aria-label={t('common.addToCart')}
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/book/${book.slug}`}
      className="card group flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-ivory-100">
        <BookCover coverUrl={book.cover_url} title={book.title_ar} className="h-full w-full" />
        {discount > 0 && (
          <span className="absolute top-2 right-2 badge bg-burgundy-600 text-ivory-50">
            -{discount}%
          </span>
        )}
        {book.bestseller && (
          <span className="absolute top-2 left-2 badge bg-gold-400 text-navy-900">
            {lang === 'ar' ? 'الأكثر مبيعًا' : 'Bestseller'}
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-600 opacity-0 shadow-sm transition-all hover:text-burgundy-600 group-hover:opacity-100"
          aria-label={t('nav.wishlist')}
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-semibold text-navy-800 line-clamp-2 group-hover:text-burgundy-600 transition-colors text-sm">
          {lang === 'ar' ? book.title_ar : (book.title_en || book.title_ar)}
        </h3>
        {authorName && (
          <p className="mt-1 text-xs text-navy-500 line-clamp-1">{authorName}</p>
        )}

        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
          <span className="text-xs font-medium text-navy-600">{book.average_rating}</span>
          <span className="text-xs text-navy-400">({book.rating_count})</span>
        </div>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-burgundy-700">{formatPrice(price, currency, lang)}</span>
            {discount > 0 && (
              <span className="text-xs text-navy-400 line-through">{formatPrice(book.regular_price, currency, lang)}</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1">
            {book.stock_quantity > 0 ? (
              <span className="text-xs font-medium text-success-600">{t('common.inStock')}</span>
            ) : (
              <span className="text-xs font-medium text-error-600">{t('common.outOfStock')}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={book.stock_quantity <= 0}
            className="btn-primary mt-2 w-full !py-2 text-xs"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {t('common.addToCart')}
          </button>
        </div>
      </div>
    </Link>
  );
}
