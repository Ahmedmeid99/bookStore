import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List, X, PackageSearch } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { storeApi, type CatalogRequest } from '@/lib/api';
import { BookCard } from '@/components/BookCard';
import { BookGridSkeleton, BookListSkeleton } from '@/components/Skeletons';
import type { Book, Category, Author } from '@/types/database';

const PAGE_SIZE = 12;

type SortKey = 'popular' | 'newest' | 'priceLow' | 'priceHigh' | 'rating';

export function CatalogPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const authorId = searchParams.get('author') || '';
  const sortBy = (searchParams.get('sort') as SortKey) || 'popular';

  const [filters, setFilters] = useState({
    language: searchParams.get('language') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    year: searchParams.get('year') || '',
    minRating: searchParams.get('minRating') || '',
    availability: searchParams.get('availability') || '',
  });

  useEffect(() => {
    Promise.all([storeApi.categories(), storeApi.authors()])
      .then(([categoryItems, authorItems]) => {
        setCategories(categoryItems);
        setAuthors(authorItems);
      })
      .catch(() => {
        setCategories([]);
        setAuthors([]);
      });
  }, []);

  const buildRequest = useCallback((pageNumber: number): CatalogRequest => ({
    search: query,
    category: categorySlug,
    authorId,
    language: filters.language,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    year: filters.year,
    minRating: filters.minRating,
    inStock: filters.availability === 'inStock',
    sort: sortBy,
    pageNumber,
    pageSize: PAGE_SIZE,
  }), [query, categorySlug, authorId, filters, sortBy]);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await storeApi.catalog(buildRequest(1));
      setBooks(result.items);
      setTotalCount(result.totalCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [buildRequest]);

  useEffect(() => { void loadBooks(); }, [loadBooks]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const result = await storeApi.catalog(buildRequest(Math.floor(books.length / PAGE_SIZE) + 1));
      setBooks((previous) => [...previous, ...result.items]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load books');
    } finally {
      setLoadingMore(false);
    }
  };

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setFilters({ language: '', minPrice: '', maxPrice: '', year: '', minRating: '', availability: '' });
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = query || categorySlug || authorId || Object.values(filters).some(Boolean);

  const renderFilterPanel = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-2">{t('catalog.filterCategory')}</label>
        <select
          value={categorySlug}
          onChange={(e) => updateParam('category', e.target.value)}
          className="input-field !py-2 text-sm"
        >
          <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{lang === 'ar' ? c.name_ar : (c.name_en || c.name_ar)}</option>
          ))}
        </select>
      </div>

      {/* Author */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-2">{t('catalog.filterAuthor')}</label>
        <select
          value={authorId}
          onChange={(e) => updateParam('author', e.target.value)}
          className="input-field !py-2 text-sm"
        >
          <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
          {authors.map((a) => (
            <option key={a.id} value={a.id}>{lang === 'ar' ? a.name_ar : (a.name_en || a.name_ar)}</option>
          ))}
        </select>
      </div>

      {/* Language */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-2">{t('catalog.filterLanguage')}</label>
        <select
          value={filters.language}
          onChange={(e) => setFilters((current) => ({ ...current, language: e.target.value }))}
          className="input-field !py-2 text-sm"
        >
          <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
          <option value="ara">{lang === 'ar' ? 'العربية' : 'Arabic'}</option>
          <option value="eng">{lang === 'ar' ? 'الإنجليزية' : 'English'}</option>
        </select>
      </div>

      {/* Price range */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-2">{t('catalog.filterPrice')} (EGP)</label>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters((current) => ({ ...current, minPrice: e.target.value }))} className="input-field !py-2 text-sm" />
          <span className="text-navy-400">-</span>
          <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="500" value={filters.maxPrice} onChange={(e) => setFilters((current) => ({ ...current, maxPrice: e.target.value }))} className="input-field !py-2 text-sm" />
        </div>
      </div>

      {/* Publication year */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-2">{t('catalog.filterYear')}</label>
        <input type="number" inputMode="numeric" min="1000" max={new Date().getFullYear()} step="1" placeholder="2024" value={filters.year} onChange={(e) => setFilters((current) => ({ ...current, year: e.target.value }))} className="input-field !py-2 text-sm" />
      </div>

      {/* Rating */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-2">{t('catalog.filterRating')}</label>
        <select
          value={filters.minRating}
          onChange={(e) => setFilters((current) => ({ ...current, minRating: e.target.value }))}
          className="input-field !py-2 text-sm"
        >
          <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
          <option value="3">3+ ★</option>
          <option value="4">4+ ★</option>
          <option value="4.5">4.5+ ★</option>
        </select>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-xs font-semibold text-navy-700 mb-2">{t('catalog.filterAvailability')}</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.availability === 'inStock'} onChange={(e) => setFilters((current) => ({ ...current, availability: e.target.checked ? 'inStock' : '' }))} className="rounded text-burgundy-600 focus:ring-gold-400" />
          <span className="text-sm text-navy-700">{t('common.inStock')}</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="btn-ghost w-full text-burgundy-600 hover:bg-burgundy-50">
          <X className="h-4 w-4" />
          {t('catalog.clearFilters')}
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900 md:text-3xl">
          {categorySlug
            ? categories.find((c) => c.slug === categorySlug)?.[lang === 'ar' ? 'name_ar' : 'name_en'] || t('catalog.title')
            : query
            ? `${lang === 'ar' ? 'نتائج البحث عن' : 'Search results for'} "${query}"`
            : t('catalog.title')}
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          {totalCount} {t('catalog.results')}
        </p>
      </div>

      {/* Search bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); updateParam('q', (fd.get('q') as string) || ''); }}
        className="mb-6"
      >
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={t('catalog.searchPlaceholder')}
            className="input-field !py-3 text-sm"
            style={lang === 'ar' ? { paddingRight: '2.5rem' } : { paddingLeft: '2.5rem' }}
          />
        </div>
      </form>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {t('catalog.filters')}
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input-field !py-2 !w-auto text-sm"
          >
            <option value="popular">{t('catalog.sort.popular')}</option>
            <option value="newest">{t('catalog.sort.newest')}</option>
            <option value="priceLow">{t('catalog.sort.priceLow')}</option>
            <option value="priceHigh">{t('catalog.sort.priceHigh')}</option>
            <option value="rating">{t('catalog.sort.rating')}</option>
          </select>

          <div className="flex rounded-lg border border-ivory-300 bg-white">
            <button onClick={() => setView('grid')} className={`p-2 rounded-r-lg ${view === 'grid' ? 'bg-navy-800 text-ivory-50' : 'text-navy-600 hover:bg-ivory-100'}`} aria-label={t('catalog.grid')}>
              <Grid className="h-4 w-4" />
            </button>
            <button onClick={() => setView('list')} className={`p-2 rounded-l-lg ${view === 'list' ? 'bg-navy-800 text-ivory-50' : 'text-navy-600 hover:bg-ivory-100'}`} aria-label={t('catalog.list')}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters - desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-navy-800 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {t('catalog.filters')}
            </h3>
            {renderFilterPanel()}
          </div>
        </aside>

        {/* Mobile filters drawer */}
        {showFilters && (
          <>
            <div className="fixed inset-0 z-40 bg-navy-900/50 lg:hidden" onClick={() => setShowFilters(false)} />
            <div className={`fixed top-0 ${lang === 'ar' ? 'right-0' : 'left-0'} z-40 h-full w-80 max-w-[85%] bg-ivory-50 p-4 overflow-y-auto shadow-2xl lg:hidden`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-800">{t('catalog.filters')}</h3>
                <button onClick={() => setShowFilters(false)} className="p-1 text-navy-600"><X className="h-5 w-5" /></button>
              </div>
              {renderFilterPanel()}
            </div>
          </>
        )}

        {/* Results */}
        <div className="flex-1 min-w-0">
          {loading ? (
            view === 'grid' ? <BookGridSkeleton count={8} /> : <BookListSkeleton count={4} />
          ) : error ? (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <PackageSearch className="h-12 w-12 text-error-400" />
              <p className="text-error-600 font-medium">{error}</p>
              <button onClick={() => loadBooks()} className="btn-primary">{t('common.retry')}</button>
            </div>
          ) : books.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 p-12 text-center">
              <PackageSearch className="h-12 w-12 text-navy-300" />
              <p className="font-semibold text-navy-700">{t('catalog.noResults')}</p>
              <p className="text-sm text-navy-400">{lang === 'ar' ? 'جرّب تعديل البحث أو التصفية' : 'Try adjusting your search or filters'}</p>
              {hasActiveFilters && <button onClick={clearFilters} className="btn-ghost text-burgundy-600">{t('catalog.clearFilters')}</button>}
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4' : 'flex flex-col gap-4'}>
                {books.map((book) => (
                  <BookCard key={book.id} book={book} variant={view} />
                ))}
              </div>
              {books.length < totalCount && (
                <div className="mt-8 flex justify-center">
                  <button onClick={loadMore} disabled={loadingMore} className="btn-secondary">
                    {loadingMore ? t('common.loading') : t('catalog.loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
