import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User, Menu, X,
  BookOpen, ChevronDown, LogOut, LayoutDashboard,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { storeApi } from '@/lib/api';
import type { Category } from '@/types/database';

export function Navbar() {
  const { lang, t } = useLanguage();
  const { itemCount, setCartOpen } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const accountRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    storeApi.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
    setCategoriesMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) setCategoriesMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-navy-900 text-ivory-100 text-center text-xs py-2 px-4">
        {t('announce.shipping')}
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-40 border-b border-ivory-200 bg-ivory-50/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-gold-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif text-lg font-bold text-navy-900">مكتبة أفق</span>
                <span className="block text-[10px] text-gold-600 -mt-1">MOQTAFAA BOOKSTORE</span>
              </div>
            </Link>

            {/* Desktop search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute top-1/2 -translate-y-1/2 text-navy-400 h-4 w-4 pointer-events-none z-10" style={lang === 'ar' ? { right: '12px' } : { left: '12px' }} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full rounded-full border border-ivory-300 bg-white py-2 pr-10 pl-4 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 outline-none"
                  style={lang === 'ar' ? { paddingRight: '2.5rem', paddingLeft: '1rem' } : { paddingLeft: '2.5rem', paddingRight: '1rem' }}
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Categories dropdown */}
              <div ref={categoriesRef} className="relative hidden lg:block">
                <button
                  onClick={() => setCategoriesMenuOpen(!categoriesMenuOpen)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-ivory-200"
                >
                  {t('nav.categories')}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {categoriesMenuOpen && (
                  <div className={`absolute top-full mt-2 ${lang === 'ar' ? 'right-0' : 'left-0'} w-64 rounded-xl border border-ivory-200 bg-white p-2 shadow-xl animate-scale-in z-50`}>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/catalog?category=${cat.slug}`}
                        className="block rounded-lg px-3 py-2 text-sm text-navy-700 transition-colors hover:bg-ivory-100"
                      >
                        {lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="rounded-lg p-2 text-navy-700 transition-colors hover:bg-ivory-200 md:hidden"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="rounded-lg p-2 text-navy-700 transition-colors hover:bg-ivory-200"
                aria-label={t('nav.wishlist')}
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative rounded-lg p-2 text-navy-700 transition-colors hover:bg-ivory-200"
                aria-label={t('nav.cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-burgundy-600 px-1 text-[10px] font-bold text-ivory-50">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Account - always visible, opens login if guest */}
              {user ? (
                <div ref={accountRef} className="relative">
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-1 rounded-lg p-2 text-navy-700 transition-colors hover:bg-ivory-200"
                    aria-label={t('nav.account')}
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-3 w-3 hidden sm:block" />
                  </button>
                  {accountOpen && (
                    <div className={`absolute top-full mt-2 ${lang === 'ar' ? 'left-0' : 'right-0'} w-56 rounded-xl border border-ivory-200 bg-white p-2 shadow-xl animate-scale-in z-50`}>
                      <div className="border-b border-ivory-200 px-3 py-2 mb-1">
                        <p className="text-sm font-semibold text-navy-900">{profile?.display_name || user.email}</p>
                        <p className="text-xs text-navy-400">{user.email}</p>
                      </div>
                      <Link to="/account" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-ivory-100">
                        <User className="h-4 w-4" /> {t('account.profile')}
                      </Link>
                      <Link to="/account/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-ivory-100">
                        <ShoppingCart className="h-4 w-4" /> {t('account.orders')}
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-ivory-100">
                        <Heart className="h-4 w-4" /> {t('nav.wishlist')}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-burgundy-700 hover:bg-burgundy-50 font-medium">
                          <LayoutDashboard className="h-4 w-4" /> {t('nav.admin')}
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut(); navigate('/'); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error-600 hover:bg-error-50"
                      >
                        <LogOut className="h-4 w-4" /> {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-lg p-2 text-navy-700 transition-colors hover:bg-ivory-200"
                  aria-label={t('nav.login')}
                  title={t('nav.login')}
                >
                  <User className="h-5 w-5" />
                  <span className="text-xs font-semibold hidden sm:inline">{t('nav.login')}</span>
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-lg p-2 text-navy-700 transition-colors hover:bg-ivory-200 lg:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <div className="pb-3 md:hidden space-y-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 text-navy-400 h-4 w-4" style={lang === 'ar' ? { right: '12px' } : { left: '12px' }} />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('nav.search')}
                    className="w-full rounded-full border border-ivory-300 bg-white py-2 pr-10 pl-4 text-sm focus:border-gold-400 focus:ring-2 focus:ring-gold-200 outline-none"
                    autoFocus
                  />
                </div>
              </form>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
                <span className="shrink-0 text-[11px] font-semibold text-navy-500">{lang === 'ar' ? 'فلاتر شائعة:' : 'Filters:'}</span>
                <Link to="/catalog?sort=popular" onClick={() => setSearchOpen(false)} className="shrink-0 rounded-full bg-ivory-200 px-2.5 py-0.5 text-navy-700 hover:bg-gold-400 hover:text-navy-950">{lang === 'ar' ? 'الأكثر مبيعًا' : 'Bestsellers'}</Link>
                <Link to="/catalog?sort=newest" onClick={() => setSearchOpen(false)} className="shrink-0 rounded-full bg-ivory-200 px-2.5 py-0.5 text-navy-700 hover:bg-gold-400 hover:text-navy-950">{lang === 'ar' ? 'أحدث الإصدارات' : 'New Releases'}</Link>
                <Link to="/catalog?sort=offers" onClick={() => setSearchOpen(false)} className="shrink-0 rounded-full bg-ivory-200 px-2.5 py-0.5 text-navy-700 hover:bg-gold-400 hover:text-navy-950">{lang === 'ar' ? 'عروض وتخفيضات' : 'Offers'}</Link>
                {categories.slice(0, 4).map((cat) => (
                  <Link key={cat.id} to={`/catalog?category=${cat.slug}`} onClick={() => setSearchOpen(false)} className="shrink-0 rounded-full bg-white border border-ivory-300 px-2.5 py-0.5 text-navy-700 hover:border-gold-400">
                    {lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-ivory-200 bg-ivory-50 px-4 py-3 space-y-1 animate-slide-up">
            <Link to="/" className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-ivory-200">{t('nav.home')}</Link>
            <Link to="/catalog" className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-800 hover:bg-ivory-200">{t('nav.catalog')}</Link>
            <div className="border-t border-ivory-200 my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-navy-400 uppercase">{t('nav.categories')}</p>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalog?category=${cat.slug}`}
                className="block rounded-lg px-3 py-2 text-sm text-navy-700 hover:bg-ivory-200"
              >
                {lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
              </Link>
            ))}
            {!user && (
              <div className="border-t border-ivory-200 my-2 pt-2">
                <Link to="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-burgundy-700 hover:bg-burgundy-50">{t('nav.login')}</Link>
                <Link to="/signup" className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-700 hover:bg-ivory-200">{t('nav.signup')}</Link>
              </div>
            )}
          </nav>
        )}

        {/* Desktop secondary nav */}
        <nav className="hidden lg:block border-t border-ivory-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 h-10">
              <Link to="/" className="nav-link text-xs">{t('nav.home')}</Link>
              <Link to="/catalog" className="nav-link text-xs">{t('nav.catalog')}</Link>
              {categories.slice(0, 5).map((cat) => (
                <Link key={cat.id} to={`/catalog?category=${cat.slug}`} className="nav-link text-xs">
                  {lang === 'ar' ? cat.name_ar : (cat.name_en || cat.name_ar)}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
