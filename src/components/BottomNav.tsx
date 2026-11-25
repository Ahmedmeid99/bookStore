import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Heart, ShoppingCart, Search, X, Phone, Facebook, Linkedin, ArrowLeft, ArrowRight, Sparkles, SlidersHorizontal, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { storeApi } from '@/lib/api';
import type { Category, Author } from '@/types/database';

function WhatsAppIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function BottomNav() {
  const { lang, t } = useLanguage();
  const { itemCount, setCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  // Load categories & authors for filter shortcuts in mobile search
  useEffect(() => {
    Promise.all([storeApi.categories(), storeApi.authors()])
      .then(([cats, auths]) => {
        setCategories(cats);
        setAuthors(auths);
      })
      .catch(() => {});
  }, []);

  // Close modals on route change
  useEffect(() => {
    setSearchModalOpen(false);
    setContactSheetOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchModalOpen(false);
      setSearchQuery('');
    }
  };

  const isProductsActive = location.pathname === '/catalog' && !location.search.includes('wishlist');
  const isWishlistActive = location.pathname === '/wishlist' || location.pathname.startsWith('/account/wishlist');

  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* Fixed Bottom Navigation Bar - Mobile Only */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-navy-900/95 backdrop-blur-md border-t border-ivory-300/80 dark:border-navy-700 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[calc(env(safe-area-inset-bottom,0px)+0.25rem)] transition-all"
      >
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {/* 1. المنتجات (Products / Catalog) */}
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-1.5 transition-colors relative ${
                isActive || isProductsActive
                  ? 'text-burgundy-700 dark:text-gold-400 font-semibold'
                  : 'text-navy-600 dark:text-ivory-300 hover:text-navy-900'
              }`
            }
          >
            <LayoutGrid className="h-5 w-5 mb-1 shrink-0" strokeWidth={isProductsActive ? 2.3 : 1.8} />
            <span className="text-[11px] leading-none tracking-tight">
              {lang === 'ar' ? 'المنتجات' : 'Products'}
            </span>
            {isProductsActive && (
              <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-burgundy-600 dark:bg-gold-400" />
            )}
          </NavLink>

          {/* 2. المفضلة (Wishlist / Favorites) */}
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-1.5 transition-colors relative ${
                isActive || isWishlistActive
                  ? 'text-burgundy-700 dark:text-gold-400 font-semibold'
                  : 'text-navy-600 dark:text-ivory-300 hover:text-navy-900'
              }`
            }
          >
            <div className="relative">
              <Heart
                className="h-5 w-5 mb-1 shrink-0"
                strokeWidth={isWishlistActive ? 2.3 : 1.8}
                fill={isWishlistActive ? 'currentColor' : 'none'}
              />
              <span className="absolute -top-1 -end-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-burgundy-600 text-[10px] font-bold tabular-nums text-white px-1 shadow-sm ring-1 ring-white">
                {wishlistCount}
              </span>
            </div>
            <span className="text-[11px] leading-none tracking-tight">
              {lang === 'ar' ? 'المفضلة' : 'Wishlist'}
            </span>
            {isWishlistActive && (
              <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-burgundy-600 dark:bg-gold-400" />
            )}
          </NavLink>

          {/* 3. السلة (Cart) */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 transition-colors text-navy-600 dark:text-ivory-300 hover:text-navy-900 relative active:scale-[0.96]"
            aria-label={t('nav.cart')}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 mb-1 shrink-0" strokeWidth={1.8} />
              <span className="absolute -top-1 -end-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-burgundy-600 text-[10px] font-bold tabular-nums text-white px-1 shadow-sm ring-1 ring-white">
                {itemCount}
              </span>
            </div>
            <span className="text-[11px] leading-none tracking-tight">
              {lang === 'ar' ? 'السلة' : 'Cart'}
            </span>
          </button>

          {/* 4. بحث (Search) */}
          <button
            type="button"
            onClick={() => setSearchModalOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 transition-colors text-navy-600 dark:text-ivory-300 hover:text-navy-900 relative active:scale-95"
            aria-label={t('nav.search')}
          >
            <Search className="h-5 w-5 mb-1 shrink-0" strokeWidth={1.8} />
            <span className="text-[11px] leading-none tracking-tight">
              {lang === 'ar' ? 'بحث' : 'Search'}
            </span>
          </button>

          {/* 5. تواصل معنا (Contact Us - WhatsApp) */}
          <button
            type="button"
            onClick={() => setContactSheetOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 transition-colors text-emerald-600 hover:text-emerald-700 relative active:scale-95"
            aria-label={lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
          >
            <div className="relative text-[#25D366]">
              <WhatsAppIcon className="h-5 w-5 mb-1 shrink-0" />
            </div>
            <span className="text-[11px] leading-none tracking-tight font-medium text-emerald-700 dark:text-emerald-400">
              {lang === 'ar' ? 'تواصل معنا' : 'Contact'}
            </span>
          </button>
        </div>
      </nav>

      {/* Quick Search Modal with Real Filter Connections */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="flex-1"
            onClick={() => setSearchModalOpen(false)}
          />
          <div className="max-h-[85vh] overflow-y-auto bg-white dark:bg-navy-900 rounded-t-3xl p-5 shadow-2xl border-t border-ivory-300 dark:border-navy-700 animate-slide-up space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-ivory-50 flex items-center gap-2">
                <Search className="h-5 w-5 text-gold-500" />
                <span>{lang === 'ar' ? 'البحث والتصفية في المكتبة' : 'Search & Filter Bookstore'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1.5 rounded-full text-navy-400 hover:bg-ivory-100 dark:hover:bg-navy-800 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث باسم الكتاب، الكاتب، أو الرقم الدولي...' : 'Search by title, author, or ISBN...'}
                className="w-full rounded-xl border border-ivory-300 dark:border-navy-600 bg-ivory-50 dark:bg-navy-800 py-3.5 pe-12 ps-4 text-sm text-navy-900 dark:text-ivory-50 placeholder:text-navy-400 focus:border-gold-400 focus:ring-2 focus:ring-gold-200 dark:focus:ring-gold-900/40 outline-none"
              />
              <button
                type="submit"
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg bg-navy-800 dark:bg-gold-500 p-2 text-white dark:text-navy-950 hover:opacity-90 transition-opacity"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* 1. Quick Filters from Catalog */}
            <div>
              <p className="text-xs font-bold text-navy-500 dark:text-ivory-300 flex items-center gap-1.5 uppercase mb-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-gold-500" />
                <span>{lang === 'ar' ? 'تصفية سريعة' : 'Quick Filters'}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: lang === 'ar' ? 'الأكثر مبيعًا' : 'Bestsellers', url: '/catalog?sort=popular' },
                  { label: lang === 'ar' ? 'أحدث الإصدارات' : 'New Releases', url: '/catalog?sort=newest' },
                  { label: lang === 'ar' ? 'عروض وتخفيضات' : 'Offers & Deals', url: '/catalog?sort=offers' },
                  { label: lang === 'ar' ? 'الأعلى تقييمًا' : 'Top Rated', url: '/catalog?sort=rating' },
                  { label: lang === 'ar' ? 'المتوفر بالمخزون' : 'In Stock Only', url: '/catalog?availability=inStock' },
                  { label: lang === 'ar' ? 'السعر: الأقل أولاً' : 'Price: Low to High', url: '/catalog?sort=priceLow' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      navigate(item.url);
                      setSearchModalOpen(false);
                    }}
                    className="rounded-full border border-burgundy-200/80 bg-burgundy-50/70 dark:bg-burgundy-950/40 px-3 py-1.5 text-xs font-semibold text-burgundy-700 dark:text-burgundy-300 hover:bg-burgundy-100 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Real Store Categories */}
            {categories.length > 0 && (
              <div>
                <p className="text-xs font-bold text-navy-500 dark:text-ivory-300 flex items-center gap-1.5 uppercase mb-2">
                  <BookOpen className="h-3.5 w-3.5 text-gold-500" />
                  <span>{lang === 'ar' ? 'تصنيفات الكتب' : 'Book Categories'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        navigate(`/catalog?category=${cat.slug}`);
                        setSearchModalOpen(false);
                      }}
                      className="rounded-full bg-ivory-100 dark:bg-navy-800 px-3 py-1.5 text-xs font-medium text-navy-800 dark:text-ivory-200 hover:bg-gold-400/20 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
                    >
                      {lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Real Authors in Catalog */}
            {authors.length > 0 && (
              <div>
                <p className="text-xs font-bold text-navy-500 dark:text-ivory-300 flex items-center gap-1.5 uppercase mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                  <span>{lang === 'ar' ? 'أبرز الكتّاب' : 'Featured Authors'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {authors.slice(0, 8).map((author) => (
                    <button
                      key={author.id}
                      type="button"
                      onClick={() => {
                        navigate(`/catalog?author=${author.id}`);
                        setSearchModalOpen(false);
                      }}
                      className="rounded-full border border-ivory-300 dark:border-navy-700 bg-white dark:bg-navy-800/80 px-3 py-1 text-xs text-navy-700 dark:text-ivory-200 hover:border-gold-400 hover:text-gold-600 transition-colors"
                    >
                      {lang === 'ar' ? author.name_ar : (author.name_en || author.name_ar)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contact Us Bottom Sheet */}
      {contactSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-navy-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="flex-1"
            onClick={() => setContactSheetOpen(false)}
          />
          <div className="bg-white dark:bg-navy-900 rounded-t-3xl p-6 shadow-2xl border-t border-ivory-300 dark:border-navy-700 animate-slide-up space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-ivory-200 dark:border-navy-800">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy-900 dark:text-ivory-50">
                  {lang === 'ar' ? 'تواصل مع الكتب' : 'Contact Al Kotob'}
                </h3>
                <p className="text-xs text-navy-500 dark:text-ivory-300 mt-0.5">
                  {lang === 'ar' ? 'يسعدنا الرد على جميع استفساراتكم واقتراحاتكم' : 'We are here to help with your inquiries'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContactSheetOpen(false)}
                className="p-1.5 rounded-full text-navy-400 hover:bg-ivory-100 dark:hover:bg-navy-800 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* WhatsApp - Primary Action */}
            <a
              href={`https://wa.me/201095814411?text=${encodeURIComponent(
                lang === 'ar'
                  ? 'مرحبًا الكتب، أرغب في الاستفسار عن خدمة أو كتاب.'
                  : 'Hello Al Kotob Bookstore, I would like to inquire about a book.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 transition-transform active:scale-[0.98] shadow-sm hover:border-emerald-400"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md">
                  <WhatsAppIcon className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-950 dark:text-emerald-200 text-sm">
                    {lang === 'ar' ? 'محادثة واتساب فورية' : 'Chat on WhatsApp'}
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {lang === 'ar' ? 'رد سريع من فريق خدمة العملاء' : 'Fast response from customer support'}
                  </p>
                </div>
              </div>
              <ArrowIcon className="h-5 w-5 text-emerald-600" />
            </a>

            {/* Direct Phone Call */}
            <a
              href="tel:+201095814411"
              className="flex items-center justify-between rounded-2xl bg-ivory-50 dark:bg-navy-800/60 border border-ivory-200 dark:border-navy-700 p-3.5 transition-transform active:scale-[0.98] hover:border-gold-400"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy-900 dark:text-ivory-100 text-sm">
                    {lang === 'ar' ? 'اتصال هاتفي مباشر' : 'Direct Phone Call'}
                  </h4>
                  <p className="text-xs text-navy-500 dark:text-ivory-400" dir="ltr">
                    +20 109 581 4411
                  </p>
                </div>
              </div>
              <ArrowIcon className="h-4 w-4 text-navy-400" />
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61591450438439"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ivory-200 bg-ivory-50 px-3 text-sm font-semibold text-navy-800 transition-colors hover:border-gold-400 dark:border-navy-700 dark:bg-navy-800/60 dark:text-ivory-100"
              >
                <Facebook className="h-5 w-5" /> Facebook
              </a>
              <a
                href="https://www.linkedin.com/in/ahmed-eid-267543225/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-ivory-200 bg-ivory-50 px-3 text-sm font-semibold text-navy-800 transition-colors hover:border-gold-400 dark:border-navy-700 dark:bg-navy-800/60 dark:text-ivory-100"
              >
                <Linkedin className="h-5 w-5" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
