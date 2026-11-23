import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { storeApi } from '@/lib/api';
import { BookCard } from '@/components/BookCard';
import type { Book } from '@/types/database';

export function WishlistPage() {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    storeApi.wishlist.list()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-ivory-200">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-burgundy-200 bg-burgundy-50 px-3 py-1 text-xs font-semibold text-burgundy-700 mb-2">
            <Heart className="h-3.5 w-3.5 fill-burgundy-600 text-burgundy-600" />
            <span>{lang === 'ar' ? 'قائمتك المفضلة' : 'Your Favorites'}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-900">
            {lang === 'ar' ? 'المفضلة' : 'Wishlist'}
          </h1>
          {user && (
            <p className="mt-1 text-xs sm:text-sm text-navy-500">
              {lang === 'ar'
                ? `لديك ${items.length} ${items.length === 1 ? 'كتاب محفوظ' : 'كتب محفوظة'} في قائمتك`
                : `You have ${items.length} saved ${items.length === 1 ? 'book' : 'books'}`}
            </p>
          )}
        </div>

        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-burgundy-600 hover:text-burgundy-700 self-start sm:self-auto transition-colors"
        >
          <span>{lang === 'ar' ? 'تصفح المزيد من الكتب' : 'Browse more books'}</span>
          <ArrowIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* Guest state */}
      {!user ? (
        <div className="rounded-3xl border border-ivory-300 bg-white p-8 sm:p-14 text-center max-w-xl mx-auto shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-burgundy-50 text-burgundy-600">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900">
            {lang === 'ar' ? 'سجّل الدخول لعرض المفضلة' : 'Sign in to view your wishlist'}
          </h2>
          <p className="mt-2 text-sm text-navy-500 leading-relaxed">
            {lang === 'ar'
              ? 'احفظ الكتب والروايات المفضلة لديك للعودة إليها ومتابعة أسعارها وشرائها في أي وقت.'
              : 'Save your favorite books to review their prices and purchase them anytime.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="btn-primary w-full sm:w-auto !px-6 !py-2.5">
              {t('nav.login')}
            </Link>
            <Link to="/catalog" className="btn-secondary w-full sm:w-auto !px-6 !py-2.5">
              {lang === 'ar' ? 'تصفح الكتب' : 'Browse Books'}
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card h-64 skeleton rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-ivory-300 bg-white p-8 sm:p-14 text-center max-w-xl mx-auto shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ivory-100 text-navy-400">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-navy-900">
            {lang === 'ar' ? 'قائمة المفضلة فارغة حاليًا' : 'Your wishlist is currently empty'}
          </h2>
          <p className="mt-2 text-sm text-navy-500 leading-relaxed">
            {lang === 'ar'
              ? 'تصفح تشكيلتنا الواسعة من أروع الكتب والروايات واضغط على أيقونة القلب لحفظ ما يعجبك.'
              : 'Explore our wide selection of books and click the heart icon to save what you like.'}
          </p>
          <Link to="/catalog" className="btn-primary mt-6 inline-flex items-center gap-2 !px-6 !py-2.5">
            <ShoppingBag className="h-4 w-4" />
            <span>{t('cart.continueShopping')}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
}
